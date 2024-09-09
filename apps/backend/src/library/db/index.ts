import { createDB } from "@remoodle/db";
import { config } from "../../config";

export const db = createDB({
  mongoURI: config.mongo.uri,
  redisURI: config.redis.uri,
});

export type { IUser } from "@remoodle/db";
