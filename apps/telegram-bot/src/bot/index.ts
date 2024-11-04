import {
  Bot,
  Context,
  GrammyError,
  HttpError,
  session,
  SessionFlavor,
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
  bot.use(callbacksHandler);

  bot.catch((err) => {
    const ctx = err.ctx;

    console.error(`Error while handling update ${ctx.update.update_id}:`);

    const e = err.error;
    if (e instanceof GrammyError) {
      logWithTimestamp("Error in update processing:", e);
    } else if (e instanceof HttpError) {
      logWithTimestamp("Could not contact Telegram:", e);
    } else if (e instanceof Error) {
      logWithTimestamp("Error in update processing:", e);
    }
  });

  return bot;
}
