import { Telegraf } from "telegraf";

import { StartCommand } from "./commands/start";

export function createBot(token: string) {
  const startCommand = new StartCommand();

  const bot = new Telegraf(token);

  bot.start(startCommand.execute);

  bot.on("message", (ctx) => {
    console.log("Received message", ctx.message);
  });

  return bot;
}
