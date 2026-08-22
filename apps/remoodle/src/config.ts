import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

const CALENDAR_URL = "https://calendar.remoodle.app";
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
  CALENDAR_API_URL: str({ default: "" }),
  CALENDAR_INTERNAL_TOKEN: str({ default: "" }),
  CABGEN_CDN_URL: str({ default: "https://cabgen.remoodle.app" }),
  SHORT_CACHE_TTL_SECONDS: num({ default: 30 }),
});

export const config = {
  telegram: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
  hatchet: {
    token: env.HATCHET_CLIENT_TOKEN,
  },
  database: {
    url: env.DATABASE_URL,
  },
  calendarApi: {
    url: env.CALENDAR_API_URL,
    internalToken: env.CALENDAR_INTERNAL_TOKEN,
  },
  calendar: {
    url: CALENDAR_URL,
    host: "calendar.remoodle.app",
    accountUrl: `${CALENDAR_URL}/account`,
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
  cache: {
    shortCacheTtlSeconds: env.SHORT_CACHE_TTL_SECONDS,
  },
};
