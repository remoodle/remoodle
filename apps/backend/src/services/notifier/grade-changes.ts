import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import { RMC } from "../../library/rmc-sdk";
import { config } from "../../config";
import type { GradeChangeEvent } from "./core/shims";
import { trackCourseDiff } from "./core/checker";
import { formatCourseDiffs } from "./core/formatter";
import { sendTelegramMessage } from "./shared";
import type { UserJobData } from "./shared";

/*
 * Handler
 */
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
export const gradeChangeWorker = new Worker(
  "grade-change",
  processGradeChangeEvent,
  {
    connection: db.redisConnection,
  },
);

export const gradeChangeQueue = new Queue("grade-change", {
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

/*
 * Crawler
 */
async function processFetchCoursesJob(job: Job<UserJobData>) {
  const { userId, userName, moodleId } = job.data;

  try {
    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_courses_overall({
      status: "inprogress",
      noOnline: true,
    });

    if (error) {
      console.error(
        `[crawler] Couldn't fetch courses for user ${userName} (${moodleId})`,
        error.message,
        error.status,
      );
      return;
    }

    const currentCourse = await db.course.findOne({ userId });

    await db.course.findOneAndUpdate(
      { userId },
      { $set: { data: data, fetchedAt: new Date() } },
      { upsert: true, new: true },
    );

    if (!currentCourse) {
      return;
    }

    if (
      Array.isArray(currentCourse.data) &&
      currentCourse.data.length &&
      Array.isArray(data) &&
      data.length
    ) {
      const { diffs, hasDiff } = trackCourseDiff(currentCourse.data, data);

      if (hasDiff) {
        const event: GradeChangeEvent = {
          userId,
          moodleId,
          payload: diffs,
        };

        await addGradeChangeJob(event);
      }
    }
  } catch (error) {
    console.error("Error executing course crawler:", error);
  }
}
export const courseWorker = new Worker(
  "course-crawler",
  processFetchCoursesJob,
  {
    connection: db.redisConnection,
    concurrency: config.crawler.concurrency,
  },
);

export const courseCrawlerQueue = new Queue("course-crawler", {
  connection: db.redisConnection,
});
export async function addCourseCrawlerJob(event: UserJobData) {
  await courseCrawlerQueue.add("course-crawler", event, {
    removeOnComplete: true,
    removeOnFail: true,
  });
}
