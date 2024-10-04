import type { ContextWithSession } from "..";
import { Group } from "../../db/models/Group";
import { User } from "../../db/models/User";
import { sendMessages } from "../utils/messageHelper";

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
    user = new User({ telegramId: ctx.from.id, role: "user" });
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
    if (!ctx.session.isSending) {
      return; 
    }
    
    const groups = await Group.find();
    for (const group of groups) {
      await sendMessages(ctx, group.telegramId);
    }
    ctx.session.isSending = false;
    ctx.session.messages = [];

}

const callbacks = {
    registerFromGroup: registerFromGroup,
    cancel: cancelHandler,
    approve: approveHandler

};

export default callbacks;
