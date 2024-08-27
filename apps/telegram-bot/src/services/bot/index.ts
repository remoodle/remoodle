import { Bot, session, SessionFlavor } from "grammy";
import { request, getAuthHeaders } from "../../helpers/hc";
import { MyContext, initial } from "./types";
import commandsHandler from "./handlers/commands";

export function createBot(token: string) {
  const bot = new Bot<MyContext>(token);

  bot.use(session({ initial }));
  bot.use(commandsHandler);

  bot.command("connect", async (ctx) => {
    if (!ctx.message?.text) {
      return;
    }

    const otp = ctx.message.text.split(" ")[1];

    const [_, error] = await request((client) =>
      client.v1.telegram.otp.verify.$post(
        {
          json: {
            otp,
          },
        },
        {
          headers: getAuthHeaders(ctx.from.id, 0),
        },
      ),
    );

    if (error) {
      return ctx.reply(error.message);
    }

    return ctx.reply("Successfully connected");
  });

  return bot;
}
