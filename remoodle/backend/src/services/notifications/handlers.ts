import { config } from "../../config";

export async function sendTelegramMessage(chatId: number, message: string) {
  const url = `https://api.telegram.org/bot${config.telegram.token}/sendMessage`;

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

  return response;
}

async function sendEmail(email: string, message: string) {
  // TODO: Send an email via Resend
}
