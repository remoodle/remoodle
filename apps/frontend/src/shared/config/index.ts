export const MODE = import.meta.env.MODE;
export const IS_PROD = import.meta.env.MODE === "production";
export const IS_DEV = import.meta.env.MODE === "development";

export const TELEGRAM_CHAT_URL = "https://t.me/remoodle";

export const TELEGRAM_BOT_NAME = import.meta.env.VITE_TELEGRAM_BOT_NAME;

export const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_NAME}`;

export const API_PRODUCTION_URL = "https://api.remoodle.app";

export const API_URL =
  import.meta.env.VITE_SERVER_URL ||
  localStorage.getItem("host") ||
  API_PRODUCTION_URL;

export const EXTERNAL = {
  how_to_find_token: "https://ext.remoodle.app/find-token",
};
