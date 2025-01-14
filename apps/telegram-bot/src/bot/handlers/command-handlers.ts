import { Context } from "grammy";
import { db } from "../../library/db";
import { request, getAuthHeaders } from "../../library/hc";
import { getDeadlineText } from "../utils";
import keyboards from "./keyboards";
import type { RegistrationContext } from "..";

async function start(ctx: RegistrationContext) {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.chat) {
    return;
  }

  const userId = ctx.from.id;

  if (ctx.chat.type !== "private") {
    await ctx.reply("This method is not allowed in groups!");
    return;
  }

  const [user, error] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );

  const token = ctx.message.text.split(" ")[1];

  if (user && !error) {
    if (user.health < 0 && token) {
      await handleRegistration(ctx, userId, token);
      return;
    }

    // If the user is already registered, greet them
    await ctx.reply(`${user.name}`, {
      reply_markup: keyboards.main,
    });
    return;
  }

  if (token && token === "connect") {
    const { token, expiryDate } = await db.telegramToken.set(userId);
    return await ctx.reply(
      `Your connection token is: ${token}\n\nPlease enter this token in the app to connect your Telegram account. This token will expire on ${expiryDate.toLocaleString()}`,
    );
  }

  if (token) {
    return await handleRegistration(ctx, userId, token);
  }

  await ctx.reply(
    `Welcome to ReMoodle! ✨\nPlease send me your Moodle token to connect your Telegram account.`,
    { reply_markup: keyboards.find_token },
  );

  ctx.session.step = "awaiting_token";
}

async function handleToken(ctx: RegistrationContext) {
  if (!ctx.message || !ctx.message.text || !ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  // Only proceed if we are awaiting the token
  if (ctx.session.step === "awaiting_token") {
    const token = ctx.message.text.trim();

    // Call the API to register the token
    await handleRegistration(ctx, userId, token);
  }
}

async function handleRegistration(
  ctx: RegistrationContext,
  userId: number,
  token: string,
) {
  const [data, error] = await request((client) =>
    client.v1.auth.token.$post(
      {
        json: {
          moodleToken: token,
        },
      },
      {
        headers: getAuthHeaders(userId),
      },
    ),
  );
  if (error) {
    // If the token is invalid, ask for the token again
    await ctx.reply("Your token is invalid. Please try again.");
    return;
  }

  // Registration successful, greet the user
  await ctx.reply(`You have registered successfully!`);
  await ctx.reply(`${data.user.name}`, {
    reply_markup: keyboards.main,
  });

  // Reset the session step
  ctx.session.step = null;
}

async function deadlines(ctx: Context) {
  if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.chat) {
    return;
  }

  const userId = ctx.from?.id;

  const short = ctx.message.text.startsWith("/ds");

  const [data, error] = await request((client) =>
    client.v1.deadlines.$get(
      {
        query: {
          daysLimit: short ? "2" : "21",
        },
      },
      {
        headers: getAuthHeaders(userId),
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
          "You are not connected to ReMoodle. Ask me in private chat.",
        );
        break;
    }
    return;
  } else if (error) {
    await ctx.reply("An error occurred. Try again later.");
    return;
  }

  if (data.length === 0) {
    await ctx.reply(
      `You have no active deadlines ${short ? "in the next 2 days " : ""}🥰`,
    );
    return;
  }

  const text =
    `Upcoming deadlines${short ? " [2 days]" : ""}:\n\n` +
    data.map(getDeadlineText).join("\n");

  if (ctx.chat.type === "private") {
    await ctx.reply(text, {
      reply_markup: short ? undefined : keyboards.single_deadline,
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

export { commands, handleToken };
