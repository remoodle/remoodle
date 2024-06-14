import dotenv from "dotenv";

dotenv.config();

export const config = {
  http: {
    host: process.env.SERVER_HOST || "0.0.0.0",
    port: Number(process.env.SERVER_PORT) || 9000,
    secret: process.env.SERVER_SECRET_TOKEN || "x00001",
  },
  core: {
    secret: process.env.CORE_SECRET || "private-token",
    url: process.env.CORE_URL || "http://127.0.0.1:8080",
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
  },
  mongo: {
    uri: process.env.MONGO_URI || "mongodb://localhost:27017",
  },
  redis: {
    uri: process.env.REDIS_URI || "redis://localhost:6379",
  },
  jwt: {
    algorithm: process.env.AUTH_JWT_ALGORITHM || "ES512",
    privateKey: Buffer.from(process.env.AUTH_JWT_PRIVATE_KEY || "", "base64"),
    publicKey: Buffer.from(process.env.AUTH_JWT_PUBLIC_KEY || "", "base64"),
    accessTokenExpiration: "4w",
    refreshTokenExpiration: "8w",
    toleranceSeconds: 300,
  },
};
