import { config } from "./config";
import { createBot } from "./bot";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { webhookCallback } from "grammy";

function main(): void {
  const bot = createBot(config.bot.token);

  process.once("SIGINT", () => {
    bot.stop();
  });

  process.once("SIGTERM", () => {
    bot.stop();
  });

  if (config.bot.webhook_host) {
    const app = new Hono();

    app.use(webhookCallback(bot, "hono"));

    const url = new URL(config.bot.token, config.bot.webhook_host).toString();

    bot.api.setWebhook(url);

    serve(app).listen({ port: config.server.port }, () => {
      console.log(`Bot is running using webhook on ${url}`);
    });
  } else {
    console.log("Bot is running");
    bot.start();
  }
}

main();
