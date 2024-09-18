import { Queue, Worker, Job } from "bullmq";
import { Telegram } from "@remoodle/utils";
import { config } from "../../config";
import { db } from "../../library/db";
import type { GradeChangeEvent, DeadlineReminderEvent } from "./core/shims";
import { formatCourseDiffs, formatDeadlineReminders } from "./core/formatter";

export async function sendTelegramMessage(chatId: number, message: string) {
  const telegram = new Telegram(config.telegram.token, chatId);

  return await telegram.notify(message, {
    parseMode: "HTML",
  });
}

// grade changes

const gradeChangeQueue = new Queue("grade-change", {
  connection: db.redisConnection,
});

const gradeChangeWorker = new Worker("grade-change", processGradeChangeEvent, {
  connection: db.redisConnection,
});

export async function addGradeChangeJob(event: GradeChangeEvent) {
  await gradeChangeQueue.add("grade-change", event, {
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  });
}

async function processGradeChangeEvent(job: Job<GradeChangeEvent>) {
  const msg = job.data;
  const user = await db.user.findOne({ moodleId: msg.moodleId });

  if (!user?.telegramId || !user.notificationSettings.telegram.gradeUpdates) {
    return;
  }

  const text = formatCourseDiffs(msg.payload);
  const response = await sendTelegramMessage(user.telegramId, text);

  if (response.ok) {
    console.log(
      `[grade-change] Sent notification to ${user.name} (${user.moodleId})`,
      JSON.stringify(msg.payload),
    );
  } else {
    console.error(
      `[grade-change] Failed to send notification to ${user.name} (${user.moodleId})`,
      response.statusText,
      response.status,
    );
    throw new Error("Failed to send Telegram message");
  }
}

gradeChangeWorker.on("error", (error) => {
  console.error("Grade Change Worker Error:", error);
});

// deadline reminders

const deadlineReminderQueue = new Queue("deadline-reminder", {
  connection: db.redisConnection,
});

const deadlineReminderWorker = new Worker(
  "deadline-reminder",
  processDeadlineReminderEvent,
  { connection: db.redisConnection },
);

export async function addDeadlineReminderJob(event: DeadlineReminderEvent) {
  await deadlineReminderQueue.add("deadline-reminder", event, {
    removeOnComplete: true,
    removeOnFail: {
      age: 24 * 3600, // keep up to 24 hours
    },
  });
}

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

deadlineReminderWorker.on("error", (error) => {
  console.error("Deadline Reminder Worker Error:", error);
});

export async function shutdownEventHandlers(signal: string) {
  console.log(`Received ${signal}, closing event handlers...`);
  await gradeChangeQueue.close();
  await deadlineReminderQueue.close();
  await gradeChangeWorker.close();
  await deadlineReminderWorker.close();
  process.exit(0);
}
