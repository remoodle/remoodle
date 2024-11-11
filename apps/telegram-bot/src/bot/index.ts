import {
  Bot,
  Context,
  session,
  SessionFlavor,
  GrammyError,
  HttpError,
} from "grammy";
import { commandsHandler, callbacksHandler } from "./handlers";
import { handleToken } from "./handlers/command-handlers";
import { logWithTimestamp } from "./utils";

interface RegistrationSession {
  step?: "awaiting_token" | null;
}

export type RegistrationContext = Context & SessionFlavor<RegistrationSession>;

export function createBot(token: string) {
  const bot = new Bot<RegistrationContext>(token);
  bot.use(session({ initial: (): RegistrationSession => ({ step: null }) }));

  bot.use(commandsHandler);
  bot.use((ctx, next) => {
    if (ctx.session.step === "awaiting_token") {
      return handleToken(ctx);
    }
    return next();
  });

  bot.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error("Error in update processing:", err);

      if (err instanceof GrammyError) {
        logWithTimestamp("Error in update processing:", err);
      } else if (err instanceof HttpError) {
        logWithTimestamp("Could not contact Telegram:", err);
      } else if (err instanceof Error) {
        logWithTimestamp("Error in update processing:", err);
      }
    }
  });

  bot.use(callbacksHandler);

  return bot;
}
