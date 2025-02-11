import { GrammyError, HttpError } from "grammy";
import { config } from "./config";
import { createBot } from "./bot";

function main(): void {
  const bot = createBot(config.bot.token);

  process.once("SIGINT", () => {
    bot.stop();
  });

  process.once("SIGTERM", () => {
    bot.stop();
  });

  console.log("Bot is running");

  bot.catch((err) => {
    const ctx = err.ctx;
    const timestamp = new Date().toISOString();
    console.error(
      `[${timestamp}] Error while handling update ${ctx.update.update_id}:`,
    );

    const e = err.error;
    if (e instanceof GrammyError) {
      console.error(`[${timestamp}] Error in request:`, e.description);
    } else if (e instanceof HttpError) {
      console.error(`[${timestamp}] Could not contact Telegram:`, e);
    } else {
      console.error(`[${timestamp}] Unknown error:`, e);
    }
  });

  bot.start();
}

main();
