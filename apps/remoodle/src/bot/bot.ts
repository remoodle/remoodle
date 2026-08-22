import { log } from "evlog";
import { hydrate } from "@grammyjs/hydrate";
import { Bot, MemorySessionStorage, session } from "grammy";
import type { Context, SessionData } from "./context";
import type { ShortCache } from "../library/short-cache";
import { coursesFeature } from "./features/courses";
import { deadlinesFeature } from "./features/deadlines";
import { scheduleFeature } from "./features/schedule";
import { settingsFeature } from "./features/settings";
import { startFeature } from "./features/start";

export function createBot(token: string, shortCache: ShortCache) {
  const bot = new Bot<Context>(token);

  bot.use(
    session({
      initial: (): SessionData => ({}),
      storage: new MemorySessionStorage<SessionData>(),
      getSessionKey: (ctx) => ctx.chat?.id.toString(),
    }),
  );

  bot.use(hydrate());

  bot.use(async (ctx, next) => {
    ctx.shortCache = shortCache;
    await next();
  });

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
    log.error({
      module: "bot",
      operation: "update",
      error: err.error instanceof Error ? err.error : new Error(String(err.error)),
      update: err.ctx.update,
    });
    err.ctx.answerCallbackQuery().catch(() => {});
  });

  return bot;
}
