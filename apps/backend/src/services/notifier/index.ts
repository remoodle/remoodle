import { Queue, Worker, Job, JobsOptions } from "bullmq";
import { db } from "../../library/db";
import { config } from "../../config";
import {
  addDeadlineCrawlerJob,
  deadlineCrawlerQueue,
  deadlineWorker,
  deadlineReminderQueue,
} from "./deadline-reminders";
import { queues } from "./shared";
import type { UserJobData } from "./shared";

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

// entry

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { logger } from "hono/logger";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";

import { addGradeChangeJob, gradeChangeQueue } from "./grade-changes";

const api = new Hono();

const serverAdapter = new HonoAdapter(serveStatic);

createBullBoard({
  queues: [
    new BullMQAdapter(gradeChangeQueue),
    new BullMQAdapter(deadlineCrawlerQueue),
    new BullMQAdapter(deadlineReminderQueue),
    new BullMQAdapter(taskQueue),
  ],
  serverAdapter,
});

const basePath = "/ui";
serverAdapter.setBasePath(basePath);

api.route(basePath, serverAdapter.registerPlugin());

api.use("*", logger());

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["POST"],
  }),
);

api.use("*", async (ctx, next) => {
  const authorization = ctx.req.header("X-Remoodle-Webhook-Secret");

  if (authorization !== config.notifier.secret) {
    return ctx.text("Forbidden", 403);
  }

  return await next();
});

api.post(
  "/webhook/grades",
  zValidator(
    "json",
    z.object({
      moodleId: z.number(),
      payload: z.array(
        z.object({
          course: z.string(),
          courseId: z.number(),
          grades: z.array(
            z.tuple([z.string(), z.number().nullable(), z.number().nullable()]),
          ),
        }),
      ),
    }),
  ),
  async (ctx) => {
    const { moodleId, payload } = ctx.req.valid("json");

    console.log(moodleId, JSON.stringify(payload));

    try {
      await addGradeChangeJob({
        moodleId,
        payload,
      });
    } catch (error: any) {
      console.error("Error adding grade change job:", error);

      return ctx.text(error.message, 500);
    }

    return ctx.text("OK", 200);
  },
);

export const startServer = () => {
  console.log("Starting server...");

  serve(
    {
      hostname: config.notifier.host,
      port: config.notifier.port,
      fetch: api.fetch,
    },
    (info) => {
      console.log(
        `Crawler wehbook is running on http://${info.address}:${info.port}`,
      );
      console.log(
        `For the UI of instance1, open http://localhost:${info.port}/ui`,
      );
    },
  );
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
