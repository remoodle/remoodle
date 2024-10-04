import { Context } from "grammy";
import { ContextWithSession, Message } from "..";

export async function scanMessage(ctx: Context): Promise<Message | null> {
  if (ctx.message?.text) {
    return { type: "text", content: ctx.message.text };
  } else if (ctx.message?.photo) {
    const photo = ctx.message.photo[ctx.message.photo.length - 1]; 
    return { type: "photo", content: { file: photo.file_id, caption: ctx.message.caption || undefined } };
  } else if (ctx.message?.document) {
    return { type: "document", content: ctx.message.document.file_id };
  } else if (ctx.message?.video) {
    return { type: "video", content: ctx.message.video.file_id };
  } else if (ctx.message?.sticker) {
    return { type: "sticker", content: ctx.message.sticker.file_id };
  } 

  return null; 
}

export async function sendMessages(ctx: ContextWithSession, chat_id: number) {
    if (!ctx.session.messages) {
        return;
    }
    for (const message of ctx.session.messages) {
        switch (message.type) {
            case "text":
                await ctx.api.sendMessage(chat_id, message.content);
                break;
            case "photo":
                await ctx.api.sendPhoto(chat_id, message.content.file, { caption: message.content.caption });
                break;
            case "document":
                await ctx.api.sendDocument(chat_id, message.content);
                break;
            case "video":
                await ctx.api.sendVideo(chat_id, message.content);
                break;
            case "sticker":
                await ctx.api.sendSticker(chat_id, message.content);
                break;
        }
    }
    
}