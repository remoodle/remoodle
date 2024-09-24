import { env, config } from "./config";
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

  if (!env.isDevelopment) {
    app.use("/webhook", webhookCallback(bot, "hono"));
    serve(app).listen({ port: config.server.port }, () => {
      console.log(`Server is running on port ${config.server.port}`);
    });
  }

  console.log("Bot is running");
  bot.start();
}

main();
