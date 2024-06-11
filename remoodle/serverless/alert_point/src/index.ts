import type { MiddlewareHandler } from "hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { cors } from "hono/cors";

const app = new Hono<{
  Variables: {
    topicsMap: Record<string, number>;
  };
  Bindings: {
    TELEGRAM_CHAT_ID: string;
    TELEGRAM_TOPICS_MAP: Record<string, number>;
    TELEGRAM_TOKEN: string;
    ALERT_POINT_TOKEN: string;
  };
}>();

export function authMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const authorization = ctx.req.header("Authorization");

    if (authorization !== `Bearer ${ctx.env.ALERT_POINT_TOKEN}`) {
      return ctx.text("Forbidden", 403);
    }

    return await next();
  };
}

export function topicsMiddleware(): MiddlewareHandler {
  return async (ctx, next) => {
    const map = ctx.env.TELEGRAM_TOPICS_MAP;

    if (!map) {
      throw new HTTPException(500, {
        message: "Topics map is not configured",
      });
    }

    ctx.set("topicsMap", JSON.parse(map));

    return await next();
  };
}

app.use("*", cors());
app.use("*", authMiddleware());
app.use("*", topicsMiddleware());

async function notifyAtTelegram({
  accessToken,
  chatId,
  topicId,
  message,
  parseMode,
}: {
  accessToken: string;
  chatId: string;
  topicId: number;
  message: string;
  parseMode: "MarkdownV2" | "HTML";
}) {
  const telegramUrl = `https://api.telegram.org/bot${accessToken}/sendMessage`;

  const options = {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_thread_id: topicId,
      text: message,
      parse_mode: parseMode,
      link_preview_options: { is_disabled: true },
    }),
  };

  return fetch(telegramUrl, options);
}

app.post("/webhook/grafana", async (ctx) => {
  const body = (await ctx.req.json()) as { title: string; message: string };

  const topics = ctx.get("topicsMap");
  const topicId = topics.grafana;

  const resp = await notifyAtTelegram({
    accessToken: ctx.env.TELEGRAM_TOKEN,
    chatId: ctx.env.TELEGRAM_CHAT_ID,
    topicId,
    message: `<b>${body.title}</b>\n${body.message}`,
    parseMode: "HTML",
  });

  if (resp.status !== 200) {
    console.error(await resp.json());
    return ctx.text(resp.statusText, 400);
  }
});

app.post("/new", async (ctx) => {
  const body = (await ctx.req.json()) as { topic: string; message: string };

  const topics = ctx.get("topicsMap");

  const topicId = topics[body.topic];

  console.log(topics, topicId);

  if (!topicId) {
    return ctx.text("Topic not found", 404);
  }

  const resp = await notifyAtTelegram({
    accessToken: ctx.env.TELEGRAM_TOKEN,
    chatId: ctx.env.TELEGRAM_CHAT_ID,
    topicId,
    message: body.message,
    parseMode: "MarkdownV2",
  });

  if (resp.status !== 200) {
    console.error(await resp.json());
    return ctx.text(resp.statusText, 400);
  }

  return ctx.text("OK", 200);
});

export default app;
