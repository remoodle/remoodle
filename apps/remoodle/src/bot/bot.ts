import { hydrate } from "@grammyjs/hydrate";
import { Bot, MemorySessionStorage, session } from "grammy";
import type { Context, SessionData } from "./context";
import { logger } from "../library/logger";
import { coursesFeature } from "./features/courses";
import { deadlinesFeature } from "./features/deadlines";
import { myDuFeature } from "./features/my-du";
import { scheduleFeature } from "./features/schedule";
import { settingsFeature } from "./features/settings";
import { startFeature } from "./features/start";

export function createBot(token: string) {
  const bot = new Bot<Context>(token);

  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: new MemorySessionStorage<SessionData>(),
      getSessionKey: (ctx) => ctx.chat?.id.toString(),
    }),
  );

  bot.use(hydrate());

  // Before `start`, which answers every other `/start` payload.
  bot.use(myDuFeature);
  bot.use(startFeature);
  bot.use(deadlinesFeature);
  bot.use(settingsFeature);
  bot.use(coursesFeature);
  bot.use(scheduleFeature);

  bot.callbackQuery("remove_message", async (ctx) => {
    try {
      await ctx.deleteMessage();
    } catch {
      await ctx.editMessageReplyMarkup().catch(() => {});
    }

    await ctx.answerCallbackQuery();
  });

  bot.catch((err) => {
    logger
      .withMetadata({
        module: "bot",
        operation: "update",
        update: err.ctx.update,
      })
      .withError(err.error instanceof Error ? err.error : new Error(String(err.error)))
      .error("bot update failed");
    err.ctx.answerCallbackQuery().catch(() => {});
  });

  return bot;
}
