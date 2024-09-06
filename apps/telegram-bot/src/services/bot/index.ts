import { Bot, Context } from "grammy";
import commandsHandler from "./handlers/commands";
import callbacksHandler from "./handlers/callbacks";

export function createBot(token: string) {
  const bot = new Bot<Context>(token);

  bot.use(commandsHandler);
  bot.use(callbacksHandler);

  return bot;
}
