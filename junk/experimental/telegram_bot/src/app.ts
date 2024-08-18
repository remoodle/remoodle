import "dotenv/config";

import { config } from "./config";

import { createServer } from "./services/server";
import { createBot } from "./services/bot";

function main(): void {
  const server = createServer();

  server.listen(config.http.port, () => {
    console.log(`💨 Server is running on port ${config.http.port}`);
  });

  const bot = createBot(config.bot.token);

  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    server.close();
  });

  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    server.close();
  });

  console.log("💨 Bot is running");

  bot.launch();
}

main();
