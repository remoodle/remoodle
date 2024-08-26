export class Telegram {
  chatId: string | number;
  accessToken: string;

  constructor(accessToken: string, chatId: string | number) {
    this.chatId = chatId;
    this.accessToken = accessToken;
  }

  notify(
    message: string,
    options?: {
      topicId?: string | number;
      parseMode?: "HTML" | "MarkdownV2";
      disableLinkPreview?: boolean;
    },
  ) {
    const telegramUrl = `https://api.telegram.org/bot${this.accessToken}/sendMessage`;

    const {
      topicId,
      parseMode = "HTML",
      disableLinkPreview = true,
    } = options || {};

    return fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: parseMode,
        ...(topicId && {
          message_thread_id: topicId,
        }),
        link_preview_options: {
          is_disabled: disableLinkPreview,
        },
      }),
    });
  }
}
