import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 8000,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "",
  scraperURL: process.env.SCRAPER_URL || "",
};
