import { ContextWithSession } from "..";

export async function register(ctx: ContextWithSession) {
  if (ctx.chat?.type === "private") {
    return registerUser(ctx);
  }
  return sendRegistrationMessage(ctx);
}

async function sendRegistrationMessage(ctx: ContextWithSession) {
  return await ctx.reply("inGroup registration process...", {
    reply_markup: {
      inline_keyboard: [[{ text: "Register", callback_data: "registerFromGroup" }]],
    },
  });
}

async function registerUser(ctx: ContextWithSession) {
  return await ctx.reply("Private registration process...");
}
