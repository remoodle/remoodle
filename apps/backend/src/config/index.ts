import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  TELEGRAM_BOT_TOKEN: str(),

  MOODLE_URL: str({ default: "https://moodle.astanait.edu.kz" }),

  MONGO_URI: str({ default: "mongodb://localhost:27017/remoodle-dev" }),
  REDIS_URI: str({ default: "redis://localhost:6379" }),

  SERVER_HOST: str({ default: "0.0.0.0" }),
  SERVER_PORT: num({ default: 9000 }),
  SERVER_SECRET: str({ default: "mKskw" }),

  ADMIN_USERNAME: str({ default: "admin" }),
  ADMIN_PASSWORD: str({ default: "admin" }),

  CLUSTER_QUEUES_PRUNE: str({ default: "0" }),
  CLUSTER_SCHEDULER_ENABLED: str({ default: "0" }),
  CLUSTER_TASKS_CONFIG_PATH: str({ default: "/configs/example.json" }),

  ALERT_WORKER_URL: str({ default: "http://localhost:8787" }),
  ALERT_WORKER_SECRET: str({ default: "UpqqN" }),
  ALERT_WORKER_ENABLED: str({ default: "0" }),

  AUTH_JWT_ALGORITHM: str({ default: "ES256" }),
  AUTH_JWT_PRIVATE_KEY: str({
    default:
      "LS0tLS1CRUdJTiBFQyBQUklWQVRFIEtFWS0tLS0tCk1IY0NBUUVFSVBkUmxFdFBrUVV6dkJzUGt2amJSZlFINlZJTXVwTmphN0R6VytjemVBU0lvQW9HQ0NxR1NNNDkKQXdFSG9VUURRZ0FFc0ttL2RpNE9RNEtBR0RQZkpsREtDVGh6ZXM2U2NnM1A3ZElkanhIN1FsODBnR0JaTWEwMQp0L2wzVVpRSmxocFVNb2ZjT2EyWjdBQTlyV2twMGVjV2R3PT0KLS0tLS1FTkQgRUMgUFJJVkFURSBLRVktLS0tLQ==",
  }),
  AUTH_JWT_PUBLIC_KEY: str({
    default:
      "LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZrd0V3WUhLb1pJemowQ0FRWUlLb1pJemowREFRY0RRZ0FFc0ttL2RpNE9RNEtBR0RQZkpsREtDVGh6ZXM2UwpjZzNQN2RJZGp4SDdRbDgwZ0dCWk1hMDF0L2wzVVpRSmxocFVNb2ZjT2EyWjdBQTlyV2twMGVjV2R3PT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t",
  }),
});

export const config = {
  http: {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    secret: env.SERVER_SECRET,
  },
  admin: {
    username: env.ADMIN_USERNAME,
    password: env.ADMIN_PASSWORD,
  },
  moodle: {
    url: env.MOODLE_URL,
  },
  cluster: {
    tasks: {
      configPath: env.CLUSTER_TASKS_CONFIG_PATH,
    },
    queues: {
      prune: env.CLUSTER_QUEUES_PRUNE === "1",
    },
    scheduler: {
      enabled: env.CLUSTER_SCHEDULER_ENABLED === "1",
    },
  },
  alert: {
    url: env.ALERT_WORKER_URL,
    secret: env.ALERT_WORKER_SECRET,
    enabled: env.ALERT_WORKER_ENABLED === "1",
  },
  telegram: {
    token: env.TELEGRAM_BOT_TOKEN,
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
  pbkdf2: {
    digestAlg: "sha256",
    keySize: 32,
    iterations: 10000,
    delimiter: "::",
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
