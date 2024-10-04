import type { ContextWithSession } from "..";
import { Group } from "../../db/models/Group";
import { User } from "../../db/models/User";
import { deleteTempMessages, sendMessages } from "../utils/messageHelper";

async function registerFromGroup(ctx: ContextWithSession) {  
    if (!ctx.from?.id){
        return await ctx.answerCallbackQuery({
            text: "Братан где айди",
            show_alert: true,
        });
    }
    var user = await User.findOne({ telegramId: ctx.from.id });
    if (user) {
        return await ctx.answerCallbackQuery({
            text: "Ты уже зареган бро",
            show_alert: true,
        });
    }
    user = new User({ telegramId: ctx.from.id, role: "admin" });
    try {
        await user.save();
    }
    catch (e) {
        return await ctx.answerCallbackQuery({
            text: "Ошибка",
            show_alert: true,
        });
    }
    await user.save();
    return await ctx.answerCallbackQuery({
        text: "Зареган",
        show_alert: true,
    });

}

async function cancelHandler(ctx: ContextWithSession) {
    if (!ctx.chat?.id) {
        return;
    }
    if (!ctx.session.isSending) {
      return await ctx.reply("You are not sending any message."); 
    }
  
    
    if (ctx.message) {
      await ctx.api.deleteMessage(ctx.chat.id, ctx.message.message_id);
    }
  
    ctx.session.isSending = false;
    ctx.session.messages = [];
    await ctx.reply("Message sending canceled.");
  }

  async function approveHandler(ctx: ContextWithSession) {
    if (!ctx.chat?.id) {
      return;
    }
    if (!ctx.session.isSending) {
      return; 
    }
    
    const groups = await Group.find();
    for (const group of groups) {
       await sendMessages(ctx, group.telegramId);
    }
    if (ctx.session.tempMessagesId) {
      await deleteTempMessages(ctx);
      ctx.session.tempMessagesId = [];
    }
    await ctx.reply("Message sent to all groups.");

    ctx.session.isSending = false;
    ctx.session.messages = [];
    ctx.session.tempMessagesId = [];

}

async function messageReady(ctx: ContextWithSession) {
    if (!ctx.chat?.id) {
      return;
    }

    const cancelButton = { text: "❌", callback_data: "cancel" };
    const approveButton = { text: "✅", callback_data: "approve" };
  
    const inlineKeyboard = {
      inline_keyboard: [
        [cancelButton, cancelButton, cancelButton],
        [cancelButton, approveButton, cancelButton],
        [cancelButton, cancelButton, cancelButton],
      ],
    };
  
    var ids = await sendMessages(ctx, ctx.chat.id);
    if (!ids) {
      return;
    }
    if (!ctx.session.tempMessagesId) {
      ctx.session.tempMessagesId = [];
    }
    ctx.session.tempMessagesId.push(...ids);
    const approval = await ctx.reply("Message is ready to send. Please approve it.", {
      reply_markup: inlineKeyboard,
    });
    ctx.session.tempMessagesId?.push(approval.message_id);
    
}

const callbacks = {
    registerFromGroup: registerFromGroup,
    cancel: cancelHandler,
    approve: approveHandler,
    messageReady: messageReady,

};

export default callbacks;
