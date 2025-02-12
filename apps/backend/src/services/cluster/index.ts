import { readFile } from "node:fs/promises";
import type { RepeatOptions, WorkerOptions } from "bullmq";
import cron from "node-cron";
import { Worker } from "bullmq";
import {
  queues,
  obliterateQueues,
  closeQueues,
  JobName,
} from "../../core/queues";
import { config } from "../../config";
import { logger } from "../../library/logger";
import { db } from "../../library/db";
import { jobs } from "./jobs";

const workers: Worker[] = [];

const defaultWorkerOptions: WorkerOptions = {
  connection: db.redisConnection,
  removeOnComplete: { age: 3600 }, // keep up to 1 day
  removeOnFail: { age: 3600 * 3 }, // keep up to 3 hours
};

const loadConfig = async () => {
  const { configPath } = config.cluster.tasks;

  logger.cluster.info(`Loading config from ${configPath}`);
  const configFile = await readFile(__dirname + configPath, "utf8");

  return JSON.parse(configFile) as {
    name: JobName;
    repeat?: Omit<RepeatOptions, "key">;
    opts?: WorkerOptions;
  }[];
};

const upsertWorkers = async () => {
  const tasks = await loadConfig();

  for (const task of tasks) {
    const clusterJob = jobs[task.name];

    if (!clusterJob) {
      throw new Error(`Job ${task.name} not found`);
    }

    const worker = new Worker(clusterJob.queueName, clusterJob.run, {
      ...defaultWorkerOptions,
      ...task.opts,
    });

    workers.push(worker);
  }
};

const upsertSchedulers = async (date?: Date | "manual" | "init") => {
  if (!config.cluster.scheduler.enabled) {
    return;
  }

  const tasks = await loadConfig();

  for (const task of tasks.filter((task) => task.repeat)) {
    const clusterJob = jobs[task.name];

    if (!clusterJob) {
      throw new Error(`Repeatable Job ${task.name} not found`);
    }

    const queue = queues[clusterJob.queueName];

    const scheduledJobs = await queue.getJobs(["delayed"]);

    if (!scheduledJobs.length) {
      logger.cluster.info(
        `Scheduling ${task.name} at ${JSON.stringify(task.repeat)}`,
      );

      await queue.upsertJobScheduler(task.name, task.repeat!, {
        data: {
          date,
        },
        opts: {
          backoff: 3,
          attempts: 6,
          removeOnFail: false,
        },
      });
    }
  }
};

const run = async () => {
  if (config.cluster.queues.prune) {
    logger.cluster.info("Obliterating queues...");
    await obliterateQueues();
  }

  logger.cluster.info("Starting cluster...");

  await upsertWorkers();

  await upsertSchedulers();
};

run().catch((e) => {
  logger.cluster.error(e);
  process.exit(1);
});

cron.schedule("*/5 * * * *", async (date) => {
  await upsertSchedulers(date);
});

export const closeWorkers = async () => {
  for (const worker of workers) {
    await worker.close();
  }
};

const gracefulShutdown = async (signal: string) => {
  logger.cluster.info(`Received ${signal}, closing server...`);
  await closeQueues();
  await closeWorkers();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
