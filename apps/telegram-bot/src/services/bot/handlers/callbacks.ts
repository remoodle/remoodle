import { Composer } from "grammy";
import { request, getAuthHeaders } from "../../../helpers/hc";
import keyboards from "../keyboards";

const callbacksHandler = new Composer();

// Menu buttons
callbacksHandler.callbackQuery("others", async (ctx) => {
  await ctx.editMessageText("Other", { reply_markup: keyboards.others });
});

callbacksHandler.callbackQuery("settings", async (ctx) => {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
});

callbacksHandler.callbackQuery("deadlines", async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [deadlines, _] = await request((client) =>
    client.v1.deadlines.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!deadlines) {
    return;
  }

  if (deadlines.length === 0) {
    await ctx.editMessageText("You have no active deadlines 🥰", {
      reply_markup: keyboards.deadlines,
    });
    return;
  }
});

// Back buttons
callbacksHandler.callbackQuery("back_to_menu", async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [rmcUser, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  await ctx.editMessageText(`${rmcUser?.user.name}`, {
    reply_markup: keyboards.main,
  });
});

callbacksHandler.callbackQuery("back_to_settings", async (ctx) => {
  await ctx.editMessageText("Settings", { reply_markup: keyboards.settings });
});

// Delete profile
callbacksHandler.callbackQuery("delete_profile", async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [rmcUser, _] = await request((client) =>
    client.v1.user.check.$get(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (!rmcUser) {
    await ctx.reply("You are not connected to ReMoodle!");
    return;
  }

  await ctx.editMessageText(
    `Are you sure to delete your ReMoodle profile?\nThis action is not irreversible and will delete all related data to you.`,
    {
      reply_markup: keyboards.delete_profile,
    },
  );
});

callbacksHandler.callbackQuery("delete_profile_yes", async (ctx) => {
  if (!ctx.from) {
    return;
  }

  const userId = ctx.from.id;

  const [_, error] = await request((client) =>
    client.v1.goodbye.$delete(
      {},
      {
        headers: getAuthHeaders(userId, 1),
      },
    ),
  );

  if (error) {
    await ctx.deleteMessage();
    await ctx.reply("An error occurred. Try again later.");
    return;
  }

  await ctx.deleteMessage();
  await ctx.reply("Your ReMoodle profile has been deleted.");
});

export default callbacksHandler;
