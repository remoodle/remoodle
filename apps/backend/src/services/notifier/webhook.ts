import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { logger } from "hono/logger";
import { config } from "../../config";
import { addGradeChangeJob } from "./grade-changes";

const api = new Hono();

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
    },
  );
};
