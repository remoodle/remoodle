import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  SERVER_HOST: str({ default: "0.0.0.0" }),
  SERVER_PORT: num({ default: 9000 }),
  SERVER_SECRET: str({ default: "aboba" }),

  SERVICES: str({ default: "api,notifier" }),

  // every 10 minutes
  CRAWLER_GRADES_CRON: str({ default: "*/10 * * * *" }),
  // every 35 minutes
  CRAWLER_DEADLINES_CRON: str({ default: "*/35 * * * *" }),
  CRAWLER_CONCURRENCY: num({ default: 1 }),

  CORE_SECRET: str({ default: "private-token" }),
  CORE_URL: str({ default: "http://127.0.0.1:8080" }),

  ALERT_WORKER_URL: str({ default: "http://localhost:8787" }),
  ALERT_WORKER_SECRET: str({ default: "ALARMA" }),
  ALERT_WORKER_ENABLED: str({ default: "1" }),

  TELEGRAM_BOT_TOKEN: str(),

  MONGO_URI: str({ default: "mongodb://localhost:27017/remoodle" }),
  REDIS_URI: str({ default: "redis://localhost:6379" }),

  AUTH_JWT_ALGORITHM: str({ default: "ES512" }),
  AUTH_JWT_PUBLIC_KEY: str({
    default:
      "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlHYk1CQUdCeXFHU000OUFnRUdCU3VCQkFBakE0R0dBQVFBSXFlSHYrRkE2VXFqSUNvVVYyK3Nuc21PeHhmQQphc0VVT09tckhOL25CZGNEVDExVjlhN296YWNMKytwemNhc1pyQUh4a0RyMm5EL2xURkNzeDlHZXZwd0JaT3J2Ckx0STd6L3plZ1AveDRURlpqVVhRZDh1eUJpcG55QXFFTUJ4aXdvL1JPdlVIeGRnbjdFOC9rRndBTTdKa2NxRzgKUVV3THBKaXlZdG1Eek8vL1dQMD0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==",
  }),
  AUTH_JWT_PRIVATE_KEY: str({
    default:
      "LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1JSGNBZ0VCQkVJQnovWjlLTklpRSs3YTdXazdJM0pLcyt5YmFtblBmRjVXN1Fia2tMUTJtOGlXNktuOUZUSTEKTitJRkdiN0VkL056UFhJbXdpcEZJYmMvT2ExNWpTdDBCakdnQndZRks0RUVBQ09oZ1lrRGdZWUFCQUFpcDRlLwo0VURwU3FNZ0toUlhiNnlleVk3SEY4QnF3UlE0NmFzYzMrY0Yxd05QWFZYMXJ1ak5wd3Y3Nm5OeHF4bXNBZkdRCk92YWNQK1ZNVUt6SDBaNituQUZrNnU4dTBqdlAvTjZBLy9IaE1WbU5SZEIzeTdJR0ttZklDb1F3SEdMQ2o5RTYKOVFmRjJDZnNUeitRWEFBenNtUnlvYnhCVEF1a21MSmkyWVBNNy85WS9RPT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQo=",
  }),
});

export const config = {
  app: {
    services: env.SERVICES.split(","),
  },
  http: {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    secret: env.SERVER_SECRET,
  },
  alert: {
    url: env.ALERT_WORKER_URL,
    secret: env.ALERT_WORKER_SECRET,
    enabled: env.ALERT_WORKER_ENABLED,
  },
  core: {
    secret: env.CORE_SECRET,
    url: env.CORE_URL,
  },
  pbkdf2: {
    digestAlg: "sha256",
    keySize: 32,
    iterations: 10000,
    delimiter: "::",
  },
  telegram: {
    token: env.TELEGRAM_BOT_TOKEN,
  },
  crawler: {
    gradesCron: env.CRAWLER_GRADES_CRON,
    deadlinesCron: env.CRAWLER_DEADLINES_CRON,
    concurrency: env.CRAWLER_CONCURRENCY,
  },
  notifications: {
    maxDeadlineThresholds: 10,
  },
  mongo: {
    uri: env.MONGO_URI,
  },
  redis: {
    uri: env.REDIS_URI,
  },
  jwt: {
    algorithm: env.AUTH_JWT_ALGORITHM,
    privateKey: Buffer.from(env.AUTH_JWT_PRIVATE_KEY || "", "base64"),
    publicKey: Buffer.from(env.AUTH_JWT_PUBLIC_KEY || "", "base64"),
    accessTokenExpiration: "4w",
    refreshTokenExpiration: "8w",
    toleranceSeconds: 300,
  },
};
