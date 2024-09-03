import { Bot, Context } from "grammy";
import { request, getAuthHeaders } from "../../helpers/hc";
import commandsHandler from "./handlers/commands";
import callbacksHandler from "./handlers/callbacks";

export function createBot(token: string) {
  const bot = new Bot<Context>(token);

  bot.use(commandsHandler);
  bot.use(callbacksHandler);

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
