import { createRequestLogger, log } from "evlog";
import { config } from "../config";
import { initRemoodleEvlog } from "../library/evlog";
import { createShortCache } from "../library/short-cache";
import { createBot } from "./bot";
import { BOT_COMMANDS } from "./commands";

async function main() {
  initRemoodleEvlog("remoodle-bot");

  const requestLog = createRequestLogger({
    method: "BOOT",
    path: "/bot/startup",
  });

  const shortCache = createShortCache();
  const bot = createBot(config.telegram.token, shortCache);
  let started = false;

  try {
    requestLog.set({
      source: "bot",
      operation: "startup",
      telegram: {
        commandCount: BOT_COMMANDS.length,
      },
    });

    await bot.api.setMyCommands(BOT_COMMANDS);
    requestLog.set({
      telegram: {
        commandsConfigured: true,
      },
    });

    await bot.start({
      onStart: (info) => {
        started = true;
        requestLog.set({
          telegram: {
            username: info.username,
          },
        });
        requestLog.emit({ status: 200 });
        log.info({
          module: "bot",
          operation: "startup",
          telegram: { username: info.username },
        });
      },
    });
  } catch (error) {
    if (!started) {
      requestLog.error(error instanceof Error ? error : new Error(String(error)), {
        step: "startup",
      });
      requestLog.emit({ status: 500 });
    }

    throw error;
  }
}

void main().catch((err) => {
  log.error({
    module: "bot",
    operation: "startup",
    error: err instanceof Error ? err : new Error(String(err)),
  });
});
