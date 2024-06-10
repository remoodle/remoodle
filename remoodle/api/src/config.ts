import dotenv from "dotenv";

dotenv.config();

export const config = {
  http: {
    host: process.env.SERVER_HOST || "0.0.0.0",
    port: Number(process.env.SERVER_PORT) || 9000,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  internal: {
    secret: process.env.API_SECRET_TOKEN,
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
