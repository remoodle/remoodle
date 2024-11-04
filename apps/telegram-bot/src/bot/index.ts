import { Bot, Context, session, SessionFlavor } from "grammy";
import { commandsHandler, callbacksHandler } from "./handlers";
import { handleToken } from "./handlers/command-handlers";

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

  return bot;
}
