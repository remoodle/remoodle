import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Telegram } from "@remoodle/utils";

function authMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const authorization = ctx.req.header("Authorization");

    if (authorization !== `Bearer ${ctx.env.ALERT_POINT_TOKEN ?? "ALARMA"}`) {
      return ctx.text("Forbidden", 403);
    }

    return await next();
  };
}

const TopicEnum = z.enum(["users", "grafana"]);

type FishEnum = z.infer<typeof TopicEnum>;

const TOPICS: Record<FishEnum, number> = {
  users: 3,
  grafana: 5,
} as const;

const app = new Hono<{
  Variables: {
    topicsMap: Record<string, number>;
  };
  Bindings: {
    TELEGRAM_CHAT_ID: string;
    TELEGRAM_BOT_TOKEN: string;
    ALERT_POINT_TOKEN: string;
  };
}>()
  .use("*", cors())
  .use("*", authMiddleware())
  .post(
    "/new",
    zValidator(
      "json",
      z.object({
        topic: TopicEnum,
        message: z.string(),
      }),
    ),
    async (ctx) => {
      const { topic, message } = ctx.req.valid("json");

      const topicId = TOPICS[topic];

      const telegram = new Telegram(
        ctx.env.TELEGRAM_BOT_TOKEN,
        ctx.env.TELEGRAM_CHAT_ID,
      );

      const resp = await telegram.notify(message, {
        topicId,
        parseMode: "HTML",
      });

      if (resp.status !== 200) {
        console.error(await resp.json());
        return ctx.text(resp.statusText, 400);
      }

      return ctx.text("OK", 200);
    },
  )
  .post(
    "/webhook/grafana",
    zValidator(
      "json",
      z.object({
        title: z.string(),
        message: z.string(),
      }),
    ),
    async (ctx) => {
      const { title, message } = ctx.req.valid("json");

      const topics = ctx.get("topicsMap");
      const topicId = topics.grafana;

      const telegram = new Telegram(
        ctx.env.TELEGRAM_BOT_TOKEN,
        ctx.env.TELEGRAM_CHAT_ID,
      );

      const resp = await telegram.notify(`<b>${title}</b>\n${message}`, {
        topicId,
        parseMode: "HTML",
      });

      if (resp.status !== 200) {
        console.error(await resp.json());
        return ctx.text(resp.statusText, 400);
      }

      return ctx.text("OK", 200);
    },
  );

export default app;

export type AppType = typeof app;
