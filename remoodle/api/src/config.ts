import dotenv from "dotenv";

dotenv.config();

export const config = {
  http: {
    port: Number(process.env.PORT) || 8000,
  },
  jwt: {
    algorithm: process.env.AUTH_JWT_ALGORITHM || "ES512",
    privateKey: Buffer.from(process.env.AUTH_JWT_PRIVATE_KEY || "", "base64"),
    publicKey: Buffer.from(process.env.AUTH_JWT_PUBLIC_KEY || "", "base64"),
    // privateKey: process.env.AUTH_JWT_PRIVATE_KEY || "",
    // publicKey: process.env.AUTH_JWT_PUBLIC_KEY || "",
    accessTokenExpiration: "4w",
    refreshTokenExpiration: "8w",
    toleranceSeconds: 300,
  },
  mongo: {
    uri: process.env.MONGO_URI,
  },
  proxy: {
    url: process.env.CORE_URL || "",
  },
};

console.log(config.jwt);
