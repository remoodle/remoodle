import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  TELEGRAM_BOT_TOKEN: str(),
  TELEGRAM_WEBHOOK_URL: str({ default: "" }),

  BACKEND_URL: str({ default: "http://localhost:9000" }),
  BACKEND_SECRET: str({ default: "aboba" }),

  REDIS_URI: str({ default: "redis://localhost:6379" }),

  SERVER_PORT: num({ default: 3000 }),
});

export const config = {
  backend: {
    url: env.BACKEND_URL,
    secret: env.BACKEND_SECRET,
  },
  bot: {
    token: env.TELEGRAM_BOT_TOKEN,
    webhook_url: env.TELEGRAM_WEBHOOK_URL,
  },
  redis: {
    uri: env.REDIS_URI,
  },
  server: {
    port: env.SERVER_PORT,
  },
};
