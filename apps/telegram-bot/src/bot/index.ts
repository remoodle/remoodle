import { Bot, Context, GrammyError, HttpError } from "grammy";
import { commandsHandler, callbacksHandler } from "./handlers";

export function createBot(token: string) {
  const bot = new Bot<Context>(token);

  bot.use(commandsHandler);
  bot.use(callbacksHandler);

  bot.catch((err) => {
    const ctx = err.ctx;

    console.error(`Error while handling update ${ctx.update.update_id}:`);

    const e = err.error;
    if (e instanceof GrammyError) {
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  return bot;
}
