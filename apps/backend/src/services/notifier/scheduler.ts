import { Queue, Worker, Job, JobsOptions } from "bullmq";
import { db } from "../../library/db";
import type { IUser } from "@remoodle/db";
import { logger } from "../../library/logger";
import { config } from "../../config";
import { addDeadlineCrawlerJob } from "./deadline-reminders";
import { queues } from "./shared";
import type { UserJobData } from "./shared";

type TaskName = "fetch-deadlines";

const withUsers = async (callback: (users: IUser[]) => Promise<void>) => {
  const users = await db.user.find({
    telegramId: { $exists: true },
    moodleId: { $exists: true },
  });

  await callback(users);
};

const fetchDeadlines = async (users: IUser[]) => {
  const t0 = performance.now();

  logger.scheduler.info(`Fetching deadlines for ${users.length} users`);

  for (const user of users) {
    const payload: UserJobData = {
      userId: user._id,
      userName: user.name,
      moodleId: user.moodleId,
    };

    await addDeadlineCrawlerJob(payload);
  }

  const t1 = performance.now();
  logger.scheduler.info(
    `Finished adding all jobs for ${users.length} users, took ${t1 - t0} milliseconds.`,
  );
};

export async function runTask(job: Job<any, any, TaskName>) {
  try {
    switch (job.name) {
      case "fetch-deadlines":
        await withUsers(fetchDeadlines);
        break;
      default:
        logger.scheduler.warn(`Unknown task ${job.name}`);
    }
  } catch (error: any) {
    logger.scheduler.error(error, `Job ${job.name} failed`);
    throw error;
  }
}
export const taskWorker = new Worker(queues.tasks, runTask, {
  connection: db.redisConnection,
});

export const taskQueue = new Queue(queues.tasks, {
  connection: db.redisConnection,
});

const addTask = async (name: TaskName, options?: JobsOptions) => {
  await taskQueue.add(name, {}, options);
};

export const startScheduler = async () => {
  await addTask("fetch-deadlines", {
    repeat: { pattern: config.crawler.deadlines.cron },
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  });
};
