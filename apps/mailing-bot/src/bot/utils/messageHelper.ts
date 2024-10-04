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

    if (!ctx.session.tempMessagesId) {
        ctx.session.tempMessagesId = [];
    }
    var messageIds = []
    for (const message of ctx.session.messages) {
        let sentMessage;
        

        switch (message.type) {
            case "text":
                sentMessage = await ctx.api.sendMessage(chat_id, message.content);
                messageIds.push(sentMessage.message_id);
                break;
            case "photo":
                sentMessage = await ctx.api.sendPhoto(chat_id, message.content.file, { caption: message.content.caption });
                messageIds.push(sentMessage.message_id);
                break;
            case "document":
                sentMessage = await ctx.api.sendDocument(chat_id, message.content);
                messageIds.push(sentMessage.message_id);
                break;
            case "video":
                sentMessage = await ctx.api.sendVideo(chat_id, message.content);
                messageIds.push(sentMessage.message_id);
                break;
            case "sticker":
                sentMessage = await ctx.api.sendSticker(chat_id, message.content);
                messageIds.push(sentMessage.message_id);
                break;
        }

        // Если сообщение было успешно отправлено, сохраняем его message_id
  
    }
    if (messageIds.length > 0) {
        return messageIds;
    }
    return null;
}

export async function deleteTempMessages(ctx: ContextWithSession) {
    if (!ctx.chat?.id) {
        return;
    }
    if (ctx.session.tempMessagesId) {
        for (const messageId of ctx.session.tempMessagesId) {
            await ctx.api.deleteMessage(ctx.chat.id, messageId);
        }
        ctx.session.tempMessagesId = [];
    }
}
