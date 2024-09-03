import { Context } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import keyboards from "../keyboards";

async function start(ctx: Context) {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.chat) {
    return;
  }

  const userId = ctx.from.id;

  if (ctx.chat.type !== "private") {
    await ctx.reply("This method is not allowed in groups!");
    return;
  }

  const [rmcUser, error] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (error) {
    const token = ctx.message.text.split(" ")[1];

    if (token) {
      const [data, authError] = await request((client) =>
        client.v1.auth.register.$post(
          {
            json: {
              moodleToken: token,
            },
          },
          {
            headers: getAuthHeaders(userId, 0),
          },
        ),
      );

      if (authError && authError.status !== 200) {
        await ctx.reply("Your token is invalid. Try again!");
        return;
      }

      await ctx.reply(`Welcome to ReMoodle, ${data?.user.name}! ✨`);
    }

    await ctx.reply(`${rmcUser?.user.name}`, {
      reply_markup: keyboards.main,
    });
  }

  await ctx.reply(
    `Welcome to ReMoodle! ✨\nSend your Moodle token by typing\n\n<strong>/start YOUR_TOKEN</strong>`,
    { parse_mode: "HTML" },
  );
}

async function deadlines(ctx: Context) {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.chat) {
    return;
  }

  const userId = ctx.from?.id;

  const [data, error] = await request((client) =>
    client.v1.deadlines.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  switch (error?.status) {
    case 401: {
      await ctx.reply("You are not authorized!");
      return;
    }
    case 200: {
      break;
    }
    default: {
      await ctx.reply(
        `ReMoodle Core Services unavailable, status ${error?.status}`,
      );
      return;
    }
  }

  console.log(data);
}

const commands = {
  start: start,
  deadlines: deadlines,
};

export default commands;
