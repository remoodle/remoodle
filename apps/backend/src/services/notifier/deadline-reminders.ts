import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import { RMC } from "../../library/rmc-sdk";
import { config } from "../../config";
import { logger } from "../../library/logger";
import type { DeadlineReminderEvent, DeadlineReminderDiff } from "./core/shims";
import { processDeadlines } from "./core/checker";
import { formatDeadlineReminders } from "./core/formatter";
import { createBlankThresholdsMap } from "./core/thresholds";
import { sendTelegramMessage, queues, jobOptions } from "./shared";
import type { UserJobData } from "./shared";

/*
 * Handler
 */
async function processDeadlineReminderEvent(job: Job<DeadlineReminderEvent>) {
  try {
    const msg = job.data;
    const user = await db.user.findOne({ moodleId: msg.moodleId });

    if (
      !user?.telegramId ||
      !user.notificationSettings.telegram.deadlineReminders
    ) {
      return job.remove();
    }

    const text = formatDeadlineReminders(msg.payload);
    const response = await sendTelegramMessage(user.telegramId, text);

    if (response.ok) {
      logger.deadlines.info(
        msg,
        `Sent notification to ${user.name} (${user.moodleId})`,
      );
    } else {
      logger.deadlines.error(
        {
          status: response.status,
          statusText: response.statusText,
        },
        `Failed to send notification to ${user.name} (${user.moodleId})`,
      );
    }
  } catch (error: any) {
    logger.deadlines.error(error, `Job ${job.name} failed`);
    throw error;
  }
}
export const deadlineReminderWorker = new Worker(
  queues.deadlinesHandler,
  processDeadlineReminderEvent,
  { connection: db.redisConnection },
);

export const deadlineReminderQueue = new Queue(queues.deadlinesHandler, {
  connection: db.redisConnection,
});
export async function addDeadlineReminderJob(event: DeadlineReminderEvent) {
  await deadlineReminderQueue.add(
    "send deadline notification",
    event,
    jobOptions,
  );
}

/*
 * Crawler
 */
async function processFetchDeadlinesJob(job: Job<UserJobData>) {
  try {
    const { userId, userName, moodleId } = job.data;

    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_deadlines({
      noOnline: true,
    });

    if (error) {
      throw new Error(error.message);
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
        for (const [
          _name,
          _date,
          _remaining,
          threshold,
        ] of reminder.deadlines) {
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
      moodleId,
      payload: deadlineReminders,
    };

    await addDeadlineReminderJob(event);
  } catch (error: any) {
    logger.deadlines.error(error, `Job ${job.name} failed`);
    throw error;
  }
}
export const deadlineCrawlerWorker = new Worker(
  queues.deadlinesCrawler,
  processFetchDeadlinesJob,
  {
    connection: db.redisConnection,
    concurrency: config.crawler.deadlines.concurrency,
  },
);

export const deadlineCrawlerQueue = new Queue(queues.deadlinesCrawler, {
  connection: db.redisConnection,
});
export async function addDeadlineCrawlerJob(event: UserJobData) {
  await deadlineCrawlerQueue.add("crawl deadlines", event, jobOptions);
}
