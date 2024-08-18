import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  SERVER_PORT: num({ default: 8888 }),

  TELEGRAM_BOT_TOKEN: str(),
});

export const config = {
  http: {
    port: env.SERVER_PORT,
  },
  bot: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
};
