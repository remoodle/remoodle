import { config } from "../../../config";

export async function notifyAtTelegram(
  chatId: number,
  message: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${config.internal.telegramToken}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
}
