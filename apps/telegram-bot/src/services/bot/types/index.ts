import { Context, SessionFlavor } from "grammy";

interface SessionData {
  token: string;
}

function initial() {
  return { token: "" };
}

type MyContext = Context & SessionFlavor<SessionData>;

export { MyContext, initial };
