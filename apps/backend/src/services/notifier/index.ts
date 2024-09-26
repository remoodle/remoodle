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

import { config } from "../../config";

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
        `[notifier] Server is running on http://${info.address}:${info.port}`,
      );
      console.log(
        `[notifier] For the UI, open http://localhost:${info.port}/ui`,
      );
    },
  );
};

export const startNotifier = async () => {
  console.log("Starting notifier...");

  startScheduler();
  startServer();
};

export async function shutdownCrawler(signal: string) {
  console.log(`Received ${signal}, closing crawler...`);

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
