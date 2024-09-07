export const org = {
  github: "https://github.com/remoodle",
  chat: "https://t.me/remoodle",
};

export const telegram = {
  bot: import.meta.env.VITE_TELEGRAM_BOT_NAME,
};

export const TELEGRAM_BOT_URL = `https://t.me/${telegram.bot}`;
