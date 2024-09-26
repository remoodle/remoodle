import { Queue, Worker, Job, JobsOptions } from "bullmq";
import { db } from "../../library/db";
import { config } from "../../config";
import {
  addDeadlineCrawlerJob,
  deadlineCrawlerQueue,
  deadlineWorker,
} from "./deadline-reminders";
import { queues } from "./shared";
import type { UserJobData } from "./shared";
import { startServer } from "./webhook";

type TaskData = {
  fetchDeadlines?: boolean;
  fetchCourses?: boolean;
};

export async function runTask(job: Job<TaskData>) {
  try {
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

      if (job.data?.fetchDeadlines) {
        await addDeadlineCrawlerJob(payload);
      }
    }

    const t1 = performance.now();
    console.log(
      `[crawler] Finished adding all jobs for ${users.length} users to queues, took ${t1 - t0} milliseconds.`,
    );
  } catch (error: any) {
    console.error(`Job ${job.name} failed with error ${error.message}`);
    throw error;
  }
}
export const taskWorker = new Worker(queues.tasks, runTask, {
  connection: db.redisConnection,
});

export const taskQueue = new Queue(queues.tasks, {
  connection: db.redisConnection,
});
const addTask = async (name: string, job: TaskData, options?: JobsOptions) => {
  await taskQueue.add(name, job, options);
};

export const startNotifier = async () => {
  console.log("Starting notifier...");

  startServer();

  await addTask(
    "fetch-deadlines",
    { fetchDeadlines: true },
    { repeat: { pattern: config.crawler.deadlines.cron } },
  );
};

export async function shutdownCrawler(signal: string) {
  console.log(`Received ${signal}, closing crawler...`);

  await deadlineCrawlerQueue.close();
  await deadlineWorker.close();

  await taskQueue.close();
  await taskWorker.close();

  process.exit(0);
}

process.on("SIGINT", () => shutdownCrawler("SIGINT"));

process.on("SIGTERM", () => shutdownCrawler("SIGTERM"));
