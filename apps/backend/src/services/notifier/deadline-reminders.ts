import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import { RMC } from "../../library/rmc-sdk";
import { config } from "../../config";
import type { DeadlineReminderEvent, DeadlineReminderDiff } from "./core/shims";
import { processDeadlines } from "./core/checker";
import { formatDeadlineReminders } from "./core/formatter";
import { createBlankThresholdsMap } from "./core/thresholds";
import { sendTelegramMessage } from "./shared";
import type { UserJobData } from "./shared";

/*
 * Handler
 */
async function processDeadlineReminderEvent(job: Job<DeadlineReminderEvent>) {
  const msg = job.data;
  const user = await db.user.findOne({ moodleId: msg.moodleId });

  if (
    !user?.telegramId ||
    !user.notificationSettings.telegram.deadlineReminders
  ) {
    return;
  }

  const text = formatDeadlineReminders(msg.payload);
  const response = await sendTelegramMessage(user.telegramId, text);

  if (response.ok) {
    console.log(
      `[deadline-reminder] Sent notification to ${user.name} (${user.moodleId})`,
      JSON.stringify(msg.payload),
    );
  } else {
    console.error(
      `[deadline-reminder] Failed to send notification to ${user.name} (${user.moodleId})`,
      response.statusText,
      response.status,
    );
    throw new Error("Failed to send Telegram message");
  }
}
export const deadlineReminderWorker = new Worker(
  "deadline-reminder",
  processDeadlineReminderEvent,
  { connection: db.redisConnection },
);

export const deadlineReminderQueue = new Queue("deadline-reminder", {
  connection: db.redisConnection,
});
export async function addDeadlineReminderJob(event: DeadlineReminderEvent) {
  await deadlineReminderQueue.add("deadline-reminder", event, {
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  });
}

/*
 * Crawler
 */
async function processFetchDeadlinesJob(job: Job<UserJobData>) {
  const { userId, userName, moodleId } = job.data;

  try {
    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_deadlines({
      noOnline: true,
    });

    if (error) {
      console.error(
        `[crawler] Couldn't fetch deadlines for user ${userName} (${moodleId})`,
        error.message,
        error.status,
      );
      return;
    }

    const user = await db.user.findOne({ moodleId });

    if (!user) {
      throw new Error(`User not found for ${userId} (${moodleId})`);
    }

    const customThresholds = user.notificationSettings.deadlineThresholds;

    const currentDeadlines = await db.deadline.findOne({ userId });

    const newDeadlinesData = data.map((deadline) => ({
      ...deadline,
      notifications:
        currentDeadlines?.data.find((d) => d.event_id === deadline.event_id)
          ?.notifications || createBlankThresholdsMap(customThresholds),
    }));

    await db.deadline.findOneAndUpdate(
      { userId },
      { $set: { data: newDeadlinesData, fetchedAt: new Date() } },
      { upsert: true, new: true },
    );

    if (!currentDeadlines) {
      return;
    }

    const deadlineReminders: DeadlineReminderDiff[] = processDeadlines(
      newDeadlinesData,
      customThresholds,
    );

    if (!deadlineReminders.length) {
      return;
    }

    for (const reminder of deadlineReminders) {
      const deadline = newDeadlinesData.find(
        (d) => d.event_id === reminder.eid,
      );

      if (deadline) {
        for (const [_name, _date, _remaining, threshold] of reminder.d) {
          if (!deadline.notifications[threshold]) {
            deadline.notifications[threshold] = true;
          }
        }
      }
    }

    await db.deadline.findOneAndUpdate(
      { userId },
      { $set: { data: newDeadlinesData } },
    );

    const event: DeadlineReminderEvent = {
      userId,
      moodleId,
      payload: deadlineReminders,
    };

    await addDeadlineReminderJob(event);
  } catch (error) {
    console.error("Error executing deadline crawler:", error);
  }
}
export const deadlineWorker = new Worker(
  "deadline-crawler",
  processFetchDeadlinesJob,
  {
    connection: db.redisConnection,
    concurrency: config.crawler.concurrency,
  },
);

export const deadlineCrawlerQueue = new Queue("deadline-crawler", {
  connection: db.redisConnection,
});
export async function addDeadlineCrawlerJob(event: UserJobData) {
  await deadlineCrawlerQueue.add("deadline-crawler", event, {
    removeOnComplete: true,
    removeOnFail: true,
  });
}
