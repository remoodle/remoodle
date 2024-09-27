import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import { logger } from "../../library/logger";
import type { GradeChangeEvent } from "./core/shims";
import { formatCourseDiffs } from "./core/formatter";
import { sendTelegramMessage, queues, jobOptions } from "./shared";

/*
 * Handler
 */
async function processGradeChangeEvent(job: Job<GradeChangeEvent>) {
  try {
    const msg = job.data;
    const user = await db.user.findOne({ moodleId: msg.moodleId });

    if (!user?.telegramId) {
      throw new Error(`User ${user} not found or not connected to Telegram`);
    }

    if (!user.notificationSettings.telegram.gradeUpdates) {
      return "notifications disabled";
    }

    const text = formatCourseDiffs(msg.payload);
    const response = await sendTelegramMessage(user.telegramId, text);

    if (response.ok) {
      logger.grades.info(
        msg,
        `Sent notification to ${user.name} (${user.moodleId})`,
      );
    } else {
      logger.grades.error(
        {
          status: response.status,
          statusText: response.statusText,
        },
        `Failed to send notification to ${user.name} (${user.moodleId})`,
      );
    }
  } catch (error: any) {
    logger.grades.error(error, `Job ${job.name} failed`);
    throw error;
  }
}
export const gradeChangeWorker = new Worker(
  queues.gradesHandler,
  processGradeChangeEvent,
  {
    connection: db.redisConnection,
  },
);

export const gradeChangeQueue = new Queue(queues.gradesHandler, {
  connection: db.redisConnection,
});
export async function addGradeChangeJob(event: GradeChangeEvent) {
  await gradeChangeQueue.add("send grade notification", event, jobOptions);
}
