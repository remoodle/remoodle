import { cleanEnv, num, str } from "envalid";
import "dotenv/config";

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    default: "development",
  }),

  SERVER_HOST: str({ default: "0.0.0.0" }),
  SERVER_PORT: num({ default: 9000 }),
  SERVER_SECRET_TOKEN: str({ default: "x00001" }),

  CORE_SECRET: str({ default: "private-token" }),
  CORE_URL: str({ default: "http://127.0.0.1:8080" }),

  TELEGRAM_BOT_TOKEN: str(),

  MONGO_URI: str({ default: "mongodb://localhost:27017" }),
  REDIS_URI: str({ default: "redis://localhost:6379" }),

  AUTH_JWT_ALGORITHM: str({ default: "ES512" }),
  AUTH_JWT_PRIVATE_KEY: str({ default: "" }),
  AUTH_JWT_PUBLIC_KEY: str({ default: "" }),
});

export const config = {
  http: {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    secret: env.SERVER_SECRET_TOKEN,
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
