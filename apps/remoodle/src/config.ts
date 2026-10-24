import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

const AITUMAP_URL = "https://aitumap.remoodle.app";

const DOCS_URL = "https://docs.remoodle.app";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),
  TELEGRAM_BOT_TOKEN: str(),
  HATCHET_CLIENT_TOKEN: str({ default: "" }),
  DATABASE_URL: str({ default: "./remoodle.db" }),
  TELEGRAM_BOT_USERNAME: str({ default: "feathermoodbot" }),
  API_PORT: num({ default: 3000 }),
  // Public origin of the API, used in iCal subscription links.
  API_URL: str({ default: "http://localhost:3000" }),
  // Public origin of the web calendar, linked from the bot.
  CALENDAR_URL: str({ default: "http://localhost:5173" }),
  // Encrypts stored My DU tokens. Changing it disconnects every My DU connection.
  ENCRYPTION_KEY: str(),
  CABGEN_CDN_URL: str({ default: "https://cabgen.remoodle.app" }),
});

export const config = {
  telegram: {
    token: env.TELEGRAM_BOT_TOKEN,
    username: env.TELEGRAM_BOT_USERNAME,
    url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}`,
  },
  hatchet: {
    token: env.HATCHET_CLIENT_TOKEN,
  },
  database: {
    url: env.DATABASE_URL,
  },
  api: {
    port: env.API_PORT,
    url: env.API_URL,
    encryptionKey: env.ENCRYPTION_KEY,
  },
  calendar: {
    url: env.CALENDAR_URL,
    host: new URL(env.CALENDAR_URL).host,
  },
  aitumap: {
    url: AITUMAP_URL,
    host: "aitumap.remoodle.app",
  },
  docs: {
    url: DOCS_URL,
    host: "docs.remoodle.app",
    moodleCalendarGuideUrl: `${DOCS_URL}/guide/moodle-calendar-url`,
  },
  roomsCdnUrl: env.CABGEN_CDN_URL,
  reminders: {
    defaultThresholds: ["P1D", "PT3H"],
    maxThresholds: 10,
  },
};
