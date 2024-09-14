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

  console.log("💨 Bot is running");

  bot.start();
}

main();
