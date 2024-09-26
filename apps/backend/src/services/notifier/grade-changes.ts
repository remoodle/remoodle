import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import type { GradeChangeEvent } from "./core/shims";
import { formatCourseDiffs } from "./core/formatter";
import { sendTelegramMessage, queues } from "./shared";

/*
 * Handler
 */
async function processGradeChangeEvent(job: Job<GradeChangeEvent>) {
  try {
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
  } catch (error: any) {
    console.error(`Job ${job.name} failed with error ${error.message}`);
    throw error;
  }
}
export const gradeChangeWorker = new Worker(
  queues.coursesHandler,
  processGradeChangeEvent,
  {
    connection: db.redisConnection,
  },
);

export const gradeChangeQueue = new Queue(queues.coursesHandler, {
  connection: db.redisConnection,
});
export async function addGradeChangeJob(event: GradeChangeEvent) {
  await gradeChangeQueue.add(
    `${queues.coursesHandler}::${event.moodleId}`,
    event,
    {
      removeOnComplete: true,
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
      },
    },
  );
}
