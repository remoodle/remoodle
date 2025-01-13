import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { pinoLogger } from "hono-pino-logger";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";

import { config } from "../../config";
import { db } from "../../library/db";
import { logger } from "../../library/logger";
import { QueueName, queues, queueValues } from "./queues";
import { JobName } from "./jobs";

const api = new Hono();

const serverAdapter = new HonoAdapter(serveStatic);

createBullBoard({
  queues: queueValues.map((queue) => new BullMQAdapter(queue)),
  serverAdapter,
});

// @ts-expect-error - TODO: Fix this
const bullBoard = api.route("/", serverAdapter.registerPlugin());

const routes = api
  .use(pinoLogger(logger.cluster))
  .use(prettyJSON())
  .use("*", async (ctx, next) => {
    const authorization = ctx.req.header("Authorization");

    if (authorization !== `Bearer ${config.cluster.server}`) {
      return ctx.text("Forbidden", 403);
    }

    return await next();
  })
  .post(
    "/user",
    zValidator(
      "json",
      z.object({
        userId: z.string(),
        moodleToken: z.string(),
      }),
    ),
    async (ctx) => {
      const { userId } = ctx.req.valid("json");

      const user = await db.user.findById(userId);

      if (!user) {
        throw new HTTPException(404, {
          message: "User not found",
        });
      }

      const courses = await db.course.find({ userId, deleted: false });

      const jobs = courses.map((course) => ({
        name: JobName.UPDATE_COURSE_GRADES,
        data: {
          userId,
          courseId: course.data.id,
          courseName: course.data.fullname,
          trackDiff: false,
        },
        opts: {
          priority: 1,
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        },
      }));

      await queues[QueueName.GRADES_FLOW].addBulk(jobs);

      return ctx.json({ status: "ok" });
    },
  );

export const app = new Hono()
  .use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  )
  .route("/", bullBoard)
  .route("/", routes);

export const startServer = () => {
  serve(
    {
      hostname: config.cluster.server.host,
      port: config.cluster.server.port,
      fetch: app.fetch,
    },
    (info) => {
      logger.cluster.info(
        `Server is running on http://${info.address}:${info.port}`,
      );
    },
  );
};

export type AppType = typeof routes;
