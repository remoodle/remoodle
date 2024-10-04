import {
  Bot,
  Context,
  GrammyError,
  HttpError,
  InputFile,
  session,
  SessionFlavor,
} from "grammy";
import baseHandler from "./handlers";
import { parseRole } from "./middlewares/parseRole";

export type Message = 
  | { type: "text"; content: string }
  | { type: "photo"; content: { file: string; caption?: string } }
  | { type: "document"; content: string }
  | { type: "video"; content: string }
  | { type: "sticker"; content: string }
  | { type: "mediaGroup"; content: {files: string[]; caption?: string } };
  

interface SessionData {
  role?: "admin" | "user" | null;
  isSending?: boolean;
  messages?: Message[];
  tempMessagesId?: number[];
}


export type ContextWithSession = Context & SessionFlavor<SessionData>;

export function createBot(token: string) {
  const bot = new Bot<ContextWithSession>(token);

  bot.use(session({ initial: (): SessionData => ({ role: null, isSending: false }) }));
  bot.use(parseRole);
  bot.use(baseHandler);


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
