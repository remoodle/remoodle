import { readFile } from "node:fs/promises";
import type { RepeatOptions, WorkerOptions } from "bullmq";
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

const run = async () => {
  if (config.cluster.queues.prune) {
    logger.cluster.info("Obliterating queues...");
    await obliterateQueues();
  }

  logger.cluster.info("Starting cluster...");
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

    worker.on("error", (err) => {
      logger.cluster.error(err, `Worker error for ${task.name}`);
    });

    worker.on("drained", () => {
      logger.cluster.info(`Worker ${task.name} drained`);
    });

    if (config.cluster.scheduler.enabled && task.repeat) {
      logger.cluster.info(
        `Scheduling ${task.name} at ${JSON.stringify(task.repeat)}`,
      );
      await queues[clusterJob.queueName].upsertJobScheduler(
        task.name,
        task.repeat,
        {
          opts: {
            backoff: 3,
            attempts: 6,
            removeOnFail: false,
          },
        },
      );
    }

    workers.push(worker);
  }
};

run().catch((e) => {
  logger.cluster.error(e);
  process.exit(1);
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
