import type { ContextWithSession } from "..";
import { Group } from "../../db/models/Group";

async function start(ctx: ContextWithSession) {
  if (!ctx.session.role) {
    return await ctx.reply("You are now registered in bot. To get permissions, please contact the admin.");
  }
  if (ctx.session.role === "user") {
    return await ctx.reply("Welcome, user!");
  }
  if (ctx.session.role === "admin") {
    return await ctx.reply("Welcome, admin!");
  }
  
}

async function connect(ctx: ContextWithSession) {
  if (ctx.chat?.type !== "group" && ctx.chat?.type !== "supergroup") {
    return await ctx.reply("This command is available only in groups.");
  }

  const userId = ctx.from?.id;
  if (!userId) {
    return await ctx.reply("User not found.");
  }

  const existingGroup = await Group.findOne({ telegramId: ctx.chat.id });
  if (existingGroup) {
    return await ctx.reply("This group is already connected to another account.");
  }
  if (ctx.session.role !== "admin") {

    const groupNamePattern = /^[A-Z]{2}-\d{4}$/; 
    if (!groupNamePattern.test(ctx.chat.title)) {
      return await ctx.reply("Group name must be in the format: XX-YYYY (e.g., SE-2203).");
    }

    const userGroup = await Group.findOne({ ownerId: userId });
    if (userGroup) {
      return await ctx.reply("You can have only one group connected to your account.");
    }
  }

  const group = new Group({
    name: ctx.chat.title,
    ownerId: userId,
    telegramId: ctx.chat.id,
  });

  await group.save();
  return await ctx.reply("Group connected successfully.");
}


const commands = {
  start: start,
  connect: connect
};

export default commands;
