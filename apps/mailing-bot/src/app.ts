import { config } from "./config";
import { createBot } from "./bot";
import { createMongoDBConnection } from "./db/connection";

function main(): void {
  createMongoDBConnection(config.mongodb.uri);

  const bot = createBot(config.bot.token);

  process.once("SIGINT", () => {
    bot.stop();
  });

  process.once("SIGTERM", () => {
    bot.stop();
  });

  console.log("Mailing-bot is running");
  bot.start();
}

main();
