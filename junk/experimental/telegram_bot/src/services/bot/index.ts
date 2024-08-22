import { Bot } from "grammy";
import { request, getAuthHeaders } from "../../helpers/hc";

export function createBot(token: string) {
  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
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
      await ctx.reply(
        "Invalid or expired OTP. Please try again from the website.",
      );
    }

    await ctx.reply("✌️");
  });

  return bot;
}
