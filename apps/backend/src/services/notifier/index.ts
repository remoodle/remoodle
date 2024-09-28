import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";

import { config } from "../../config";
import { logger } from "../../library/logger";

import {
  deadlineCrawlerWorker,
  deadlineCrawlerQueue,
  deadlineReminderWorker,
  deadlineReminderQueue,
} from "./deadline-reminders";

import { addGradeChangeJob, gradeChangeQueue } from "./grade-changes";

import { startScheduler, taskWorker, taskQueue } from "./scheduler";

const api = new Hono();

const serverAdapter = new HonoAdapter(serveStatic);

const queues = [
  gradeChangeQueue,
  deadlineCrawlerQueue,
  deadlineReminderQueue,
  taskQueue,
];

createBullBoard({
  queues: queues.map((queue) => new BullMQAdapter(queue)),
  serverAdapter,
});

api.route("/", serverAdapter.registerPlugin());

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

api.get("/health", async (ctx) => {
  try {
    const queues = [
      gradeChangeQueue,
      deadlineCrawlerQueue,
      deadlineReminderQueue,
      taskQueue,
    ];

    const queueStatuses = await Promise.all(
      queues.map(async (queue) => {
        try {
          const client = await queue.client;
          return client.status === "ready";
        } catch (error) {
          logger.notifier.error(error, `Error checking queue ${queue.name}:`);
          return false;
        }
      }),
    );

    const allQueuesReady = queueStatuses.every((status) => status);

    if (allQueuesReady) {
      return ctx.json(
        { status: "healthy", message: "All queues are ready" },
        200,
      );
    } else {
      return ctx.json(
        { status: "unhealthy", message: "One or more queues are not ready" },
        503,
      );
    }
  } catch (error) {
    logger.notifier.error(error, "Error in health check");
    return ctx.json(
      { status: "error", message: "Error checking queue health" },
      500,
    );
  }
});

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

    try {
      await addGradeChangeJob({
        moodleId,
        payload,
      });
    } catch (error: any) {
      logger.notifier.error(error, "Error adding grade change job");

      return ctx.text(error.message, 500);
    }

    return ctx.text("OK", 200);
  },
);

export const startServer = () => {
  logger.notifier.info("Starting server...");

  serve(
    {
      hostname: config.notifier.host,
      port: config.notifier.port,
      fetch: api.fetch,
    },
    (info) => {
      logger.notifier.info(
        `Server is running on http://${info.address}:${info.port}`,
      );
      logger.notifier.info(`For the UI, open http://localhost:${info.port}/ui`);
    },
  );
};

export async function shutdownCrawler(signal: string) {
  logger.notifier.info(`Received ${signal}, closing crawler...`);

  await deadlineCrawlerWorker.close();
  await deadlineCrawlerQueue.close();

  await taskWorker.close();
  await taskQueue.close();

  await deadlineReminderWorker.close();
  await deadlineReminderQueue.close();

  process.exit(0);
}

process.on("SIGINT", () => shutdownCrawler("SIGINT"));

process.on("SIGTERM", () => shutdownCrawler("SIGTERM"));

export const startNotifier = async () => {
  logger.notifier.info("Starting notifier...");

  startScheduler();
  startServer();
};

startNotifier();
