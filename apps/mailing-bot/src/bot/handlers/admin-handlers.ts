import { InlineKeyboard } from 'grammy';
import { ContextWithSession } from "..";
import { Group } from "../../db/models/Group";
import { User } from "../../db/models/User";
import { deleteTempMessages, scanMessage, sendMessages } from "../utils/messageHelper";

async function register(ctx: ContextWithSession) {
  if (ctx.chat?.type !== "private") {
    return sendRegistrationMessage(ctx)
    
  }
  if (!ctx.message || !ctx.message.text) {
    await ctx.reply("Invalid message format.");
    return;
  }
  const commandParts = ctx.message.text.split(" ");
  if (commandParts.length < 2) {
    await ctx.reply("Please provide a valid username. Example: /register @username");
    return;
  }

  const username = commandParts[1].replace("@", ""); 

  const user = await User.findOne({ username }); 

  if (!user) {
    await ctx.reply("This user has not interacted with the bot yet or is not found.");
    return;
  }

  user.role = "user"; 
  await user.save();

  await ctx.reply(`User ${username} has been successfully registered with role ${user.role}.`);
}

async function sendRegistrationMessage(ctx: ContextWithSession) {
  return await ctx.reply("inGroup registration process...", {
    reply_markup: {
      inline_keyboard: [[{ text: "Register", callback_data: "registerFromGroup" }]],
    },
  });
}

async function send(ctx: ContextWithSession) {
  if (ctx.chat?.type !== "private") {
    return await ctx.reply("This command is available only in private chat.");
  }
  const tempReply = await ctx.reply("Вы вошли в режим рассылки. Отправьте сообщение, которое хотите отправить всем группам.");
  ctx.session.isSending = true;
}

async function sendingHandler(ctx: ContextWithSession) {
  if (!ctx.session.isSending) {
    return;
  }
  if (ctx.session.role !== "admin") {
    return await ctx.reply("You do not have permission to send messages.");
  }
  if (ctx.chat?.type !== "private") {
    return await ctx.reply("This command is available only in private chat.");
  }

  const message = await scanMessage(ctx);
  if (!message) {
    return await ctx.reply("Invalid message format.");
  }
  if (!ctx.session.messages) {
    ctx.session.messages = [];
  }
  ctx.session.messages.push(message);

  if (ctx.session.tempMessagesId) {
    await deleteTempMessages(ctx);
    ctx.session.tempMessagesId = [];
  }
  if (!ctx.session.tempMessagesId) {
    ctx.session.tempMessagesId = [];
  }
  

  const tempReply = await ctx.reply("Message added to the list. Is it all?", {
    reply_markup: new InlineKeyboard().text("Yes", "messageReady"),
  });

  ctx.session.tempMessagesId.push(tempReply.message_id);
  
}






const adminCommands = {
  register: register,
  send: send,
  sendingHandler: sendingHandler,
};

export default adminCommands;


