import { config } from "../config";
import { m } from "./i18n/messages.js";

type InlineKeyboardButton = { text: string; callback_data: string };
type InlineKeyboard = { inline_keyboard: InlineKeyboardButton[][] };

const DEFAULT_KEYBOARD: InlineKeyboard = {
  inline_keyboard: [[{ text: m.ui_clear(), callback_data: "remove_message" }]],
};

export async function sendTelegramMessage(
  chatId: number,
  message: string,
  replyMarkup: InlineKeyboard = DEFAULT_KEYBOARD,
): Promise<void> {
  const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: replyMarkup,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${res.status}: ${body}`);
  }
}
