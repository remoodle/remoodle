import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  SERVER_PORT: num({ default: 8888 }),

  ALERT_WORKER_URL: str({ default: "http://localhost:8787" }),
  ALERT_WORKER_SECRET: str({ default: "YWxhcm1h" }),

  TELEGRAM_BOT_TOKEN: str(),

  BACKEND_URL: str({ default: "http://localhost:9000" }),
  BACKEND_SECRET: str({ default: "aboba" }),

  REDIS_URI: str({ default: "redis://localhost:6379" }),
});

export const config = {
  backend: {
    url: env.BACKEND_URL,
    secret: env.BACKEND_SECRET,
  },
  http: {
    port: env.SERVER_PORT,
  },
  bot: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
  redis: {
    uri: env.REDIS_URI,
  },
  alert: {
    url: env.ALERT_WORKER_URL,
    secret: env.ALERT_WORKER_SECRET,
  },
};
