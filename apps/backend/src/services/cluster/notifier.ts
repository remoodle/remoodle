import { Telegram } from "@remoodle/utils";
import { config } from "../../config";

export async function sendTelegramMessage(chatId: number, message: string) {
  const telegram = new Telegram(config.telegram.token, chatId);

  return await telegram.notify(message, {
    parseMode: "HTML",
    replyMarkup: [
      [
        {
          text: "Clear",
          callback_data: "remove_message",
        },
      ],
    ],
  });
}
