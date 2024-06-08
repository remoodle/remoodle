import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono<{
  Bindings: {
    TELEGRAM_CHAT_ID: string;
    TELEGRAM_TOPICS_MAP: Record<string, number>;
    TELEGRAM_TOKEN: string;
    ALERT_POINT_TOKEN: string;
  };
}>();

app.use("*", cors());

app.post("/webhook/grafana", async (ctx) => {
  const authorization = ctx.req.header("Authorization");

  if (authorization !== `Bearer ${ctx.env.ALERT_POINT_TOKEN}`) {
    return ctx.text("Forbidden", 403);
  }

  const jsonData = (await ctx.req.json()) as {
    title: string;
    message: string;
    topic: string;
  };

  const topicId = ctx.env.TELEGRAM_TOPICS_MAP[jsonData.topic];

  if (!topicId) {
    return ctx.text("Forbidden", 403);
  }

  const resp = await fetch(
    `https://api.telegram.org/bot${ctx.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        chat_id: ctx.env.TELEGRAM_CHAT_ID,
        message_thread_id: topicId,
        text: `<b>${jsonData.title}</b>\n${jsonData.message}`,
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
    },
  );

  if (resp.status !== 200) {
    console.error(await resp.json());
    return ctx.text(resp.statusText, 400);
  }

  return ctx.text("OK", 200);
});

export default app;
