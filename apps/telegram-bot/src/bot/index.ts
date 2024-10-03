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

interface MySession {
  step?: "awaiting_token" | null;
}

type MyContext = Context & SessionFlavor<MySession>;

export function createBot(token: string) {
  const bot = new Bot<MyContext>(token);
  bot.use(session({ initial: (): MySession => ({ step: null }) }));

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
      console.error("Error in request:", e.description);
    } else if (e instanceof HttpError) {
      console.error("Could not contact Telegram:", e);
    } else {
      console.error("Unknown error:", e);
    }
  });

  return bot;
}

export default MyContext;
