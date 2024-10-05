import { cleanEnv, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  TELEGRAM_BOT_TOKEN: str(),
  MONGO_URI: str({ default: "mongodb://localhost:27017/mailing-bot" }),
  ADMIN_ID: str(),
});

export const config = {
  mongodb: {
    uri: env.MONGO_URI,
  },
  bot: {
    token: env.TELEGRAM_BOT_TOKEN,
    adminId: env.ADMIN_ID,
  },
};
