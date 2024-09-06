import { Context, InlineKeyboard } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import { getDeadlineText } from "../utils";
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

  if (rmcUser && !error) {
    await ctx.reply(`${rmcUser?.user.name}`, {
      reply_markup: keyboards.main,
    });
    return;
  }

  const token = ctx.message.text.split(" ")[1];

  if (token && token === "connect") {
    // pass
    return;
  }

  if (!token && error) {
    await ctx.reply(
      `Welcome to ReMoodle! ✨\nSend your Moodle token by typing\n\n<strong>/start YOUR_TOKEN</strong>`,
      { parse_mode: "HTML", reply_markup: keyboards.find_token },
    );
    return;
  }

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

  if (authError && authError.status === 500) {
    await ctx.reply("Your token is invalid. Try again!");
    return;
  }

  if (data && !authError) {
    await ctx.reply(`You have registered successfully!`);
    await ctx.reply(`${data?.user.name}`, {
      reply_markup: keyboards.main,
    });
  }

  if (authError) {
    console.log(authError);
    await ctx.reply("An error occurred. Try again later.");
  }
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

  if (error && error.status === 401) {
    switch (ctx.chat.type) {
      case "private":
        await ctx.reply(
          "You are not connected to ReMoodle. Send /start to connect.",
        );
        break;
      case "group":
        await ctx.reply(
          "You are not connected to ReMoodle. Ask me in private.",
        );
        break;
    }
    return;
  } else if (error) {
    console.log(error);
    await ctx.reply("An error occurred. Try again later.");
    return;
  }

  if (data.length === 0) {
    if (ctx.chat.type === "private") {
      await ctx.reply("You have no active deadlines 🥰", {
        reply_markup: new InlineKeyboard().text("Refresh", "refresh_deadlines"),
      });
    } else {
      await ctx.reply("You have no active deadlines 🥰");
    }
    return;
  }

  const text = "Upcoming deadlines:\n\n" + data.map(getDeadlineText).join("\n");

  if (ctx.chat.type === "private") {
    await ctx.reply(text, {
      reply_markup: keyboards.single_deadline,
      parse_mode: "HTML",
    });
  } else {
    await ctx.reply(text, { parse_mode: "HTML" });
  }
}

const commands = {
  start: start,
  deadlines: deadlines,
};

export default commands;
