import { Bot, Context, GrammyError, HttpError, session, SessionFlavor } from "grammy";

interface SessionData {
  role?: "admin" | "user" | null;
}

export type ContextWithSession = Context & SessionFlavor<SessionData>;



export function createBot(token: string) {
  const bot = new Bot<ContextWithSession>(token);

  bot.use(session({ initial: (): SessionData => ({ role: null }) }));


  // Add handlers here

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
