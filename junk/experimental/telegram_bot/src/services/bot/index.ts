import { Bot } from "grammy";
import { request, getAuthHeaders } from "../../helpers/hc";

export function createBot(token: string) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    if (!ctx.message?.text) {
      return;
    }

    const token = ctx.message.text.split(" ")[1];

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

  return bot;
}
