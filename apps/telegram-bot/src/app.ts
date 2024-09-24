import { config } from "./config";
import { createBot } from "./bot";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { webhookCallback } from "grammy";

function main(): void {
  const app = new Hono();
  const bot = createBot(config.bot.token);

  process.once("SIGINT", () => {
    bot.stop();
  });

  process.once("SIGTERM", () => {
    bot.stop();
  });

  if (config.bot.webhook_url) {
    app.use(webhookCallback(bot, "hono"));

    bot.api.setWebhook(config.bot.webhook_url);

    serve(app).listen({ port: config.server.port }, () => {
      console.log(`Bot is running using webhook on ${config.bot.webhook_url}`);
    });
  } else {
    console.log("Bot is running");
    bot.start();
  }
}

main();
