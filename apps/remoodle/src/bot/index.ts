import { config } from "../config";
import { logger } from "../library/logger";
import { createBot } from "./bot";
import { BOT_COMMANDS } from "./commands";

const log = logger.child().withContext({ module: "bot", operation: "startup" });

async function main() {
  const bot = createBot(config.telegram.token);

  await bot.api.setMyCommands(BOT_COMMANDS);
  log.withMetadata({ commandCount: BOT_COMMANDS.length }).info("bot commands configured");

  await bot.start({
    onStart: (info) => {
      log.withMetadata({ username: info.username }).info("bot started");
    },
  });
}

main().catch((error) => {
  log
    .withError(error instanceof Error ? error : new Error(String(error)))
    .error("bot startup failed");
});
