import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Telegram } from "@remoodle/utils";

const zTopicType = z.enum(["users", "users2", "dev", "errors", "notifier"]);

type TopicType = z.infer<typeof zTopicType>;

const TOPICS: Record<TopicType, number> = {
  users: 3, // deprecated
  users2: 329,
  dev: 327,
  errors: 309,
  notifier: 500,
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
  .use("*", async (ctx, next) => {
    const authorization = ctx.req.header("Authorization");

    if (authorization !== `Bearer ${ctx.env.ALERT_POINT_TOKEN ?? "ALARMA"}`) {
      return ctx.text("Forbidden", 403);
    }

    return await next();
  })
  .post(
    "/new",
    zValidator(
      "json",
      z.object({
        topic: zTopicType,
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
  );

export default app;

export type AppType = typeof app;
