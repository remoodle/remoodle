import { Bot } from "grammy";
import { request, getAuthHeaders } from "../../helpers/hc";
import { db } from "../../library/db";

export function createBot(token: string) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    if (!ctx.message?.text) {
      return;
    }

    const token = ctx.message.text.split(" ")[1];

    if (token === "connect") {
      const { token, expiryDate } = await db.telegramToken.set(ctx.from.id);

      return ctx.reply(
        `Your connection token is: ${token}\n\nPlease enter this token in the app to connect your Telegram account. This token will expire on ${expiryDate.toLocaleString()}`,
      );
    }

    const [data, error] = await request((client) =>
      client.v1.telegram.register.$post(
        {
          json: {
            moodleToken: token,
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

    return ctx.reply(data.user.name);
  });

  bot.command("test", async (ctx) => {
    if (!ctx.message) {
      return;
    }

    const [data, error] = await request((client) =>
      client.v1.user.check.$get(
        {},
        {
          headers: getAuthHeaders(ctx.from?.id, 1),
        },
      ),
    );

    if (error) {
      return ctx.reply(error.message);
    }

    return ctx.reply(JSON.stringify(data));
  });

  return bot;
}
