import { Queue, Worker, Job, JobsOptions } from "bullmq";
import { db } from "../../library/db";
import { config, env } from "../../config";
import type { UserJobData } from "./shared";
import {
  addCourseCrawlerJob,
  courseCrawlerQueue,
  courseWorker,
} from "./grade-changes";
import {
  addDeadlineCrawlerJob,
  deadlineCrawlerQueue,
  deadlineWorker,
} from "./deadline-reminders";

type TaskData = {
  fetchDeadlines?: boolean;
  fetchCourses?: boolean;
};

export async function runTask(job: Job<TaskData>) {
  const t0 = performance.now();

  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  for (const user of users) {
    const payload: UserJobData = {
      userId: user._id,
      userName: user.name,
      moodleId: user.moodleId,
    };

    if (job.data?.fetchCourses) {
      await addCourseCrawlerJob(payload);
    }

    if (job.data?.fetchDeadlines) {
      await addDeadlineCrawlerJob(payload);
    }
  }

  const t1 = performance.now();
  console.log(
    `[crawler] Finished adding all jobs for ${users.length} users to queues, took ${t1 - t0} milliseconds.`,
  );
}
export const taskWorker = new Worker("task-queue", runTask, {
  connection: db.redisConnection,
});

export const taskQueue = new Queue("task-queue", {
  connection: db.redisConnection,
});
const addTask = async (job: TaskData, options: JobsOptions) => {
  await taskQueue.add("task-queue", job, options);
};

export const startNotifier = async () => {
  if (env.isProduction) {
    await new Promise((resolve) => setTimeout(resolve, 30_000));
  }

  await addTask(
    { fetchCourses: true },
    { repeat: { pattern: config.crawler.gradesCron } },
  );
  await addTask(
    { fetchDeadlines: true },
    { repeat: { pattern: config.crawler.deadlinesCron } },
  );
};

export async function shutdownCrawler(signal: string) {
  console.log(`Received ${signal}, closing crawler...`);

  await courseCrawlerQueue.close();
  await courseWorker.close();

  await deadlineCrawlerQueue.close();
  await deadlineWorker.close();

  await taskQueue.close();
  await taskWorker.close();

  process.exit(0);
}

process.on("SIGINT", () => shutdownCrawler("SIGINT"));

process.on("SIGTERM", () => shutdownCrawler("SIGTERM"));
