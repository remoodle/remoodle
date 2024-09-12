import { Queue, Worker, Job } from "bullmq";
import { db } from "../../library/db";
import { RMC } from "../../library/rmc-sdk";
import type {
  GradeChangeEvent,
  DeadlineReminderEvent,
  DeadlineReminderDiff,
} from "./core/shims";
import { trackCourseDiff, processDeadlines } from "./core/checker";
import { createBlankThresholdsMap } from "./core/thresholds";
import { addGradeChangeJob, addDeadlineReminderJob } from "./events";

// course crawler

const courseCrawlerQueue = new Queue("course-crawler", {
  connection: db.redisConnection,
});

const courseWorker = new Worker("course-crawler", processFetchCoursesJob, {
  connection: db.redisConnection,
});

async function processFetchCoursesJob(
  job: Job<{ userId: string; moodleId: number }>,
) {
  const { userId, moodleId } = job.data;

  try {
    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_courses_overall({
      status: "inprogress",
      noOnline: true,
    });

    if (error) {
      console.error(
        `[crawler] Couldn't fetch courses for user ${userId} (${moodleId})`,
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

courseWorker.on("error", (error) => {
  console.error("Course Crawler Worker Error:", error);
});

// deadline crawler

const deadlineCrawlerQueue = new Queue("deadline-crawler", {
  connection: db.redisConnection,
});

const deadlineWorker = new Worker(
  "deadline-crawler",
  processFetchDeadlinesJob,
  { connection: db.redisConnection },
);

async function processFetchDeadlinesJob(
  job: Job<{ userId: string; moodleId: number }>,
) {
  const { userId, moodleId } = job.data;

  try {
    const rmc = new RMC({ moodleId });
    const [data, error] = await rmc.v1_user_deadlines({
      noOnline: true,
    });

    if (error) {
      console.error(
        `[crawler] Couldn't fetch deadlines for user ${userId} (${moodleId})`,
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

deadlineWorker.on("error", (error) => {
  console.error("Deadline Crawler Worker Error:", error);
});

export async function runCrawler() {
  console.log(`[crawler] Starting crawler`);
  const t0 = performance.now();

  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  console.log(`[crawler] Found ${users.length} users with Telegram ID`);

  for (const user of users) {
    await courseCrawlerQueue.add(
      "fetch-courses",
      {
        userId: user._id,
        moodleId: user.moodleId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
    await deadlineCrawlerQueue.add(
      "fetch-deadlines",
      {
        userId: user._id,
        moodleId: user.moodleId,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }

  const t1 = performance.now();
  console.log(
    `[crawler] Finished adding all jobs to queues, took ${t1 - t0} milliseconds.`,
  );
}

export async function shutdownCrawler(signal: string) {
  console.log(`Received ${signal}, closing crawler...`);
  await courseCrawlerQueue.close();
  await deadlineCrawlerQueue.close();
  await courseWorker.close();
  await deadlineWorker.close();
  process.exit(0);
}
