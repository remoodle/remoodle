import { DB } from "@remoodle/db";
import { config } from "../../config";

export const db = new DB({
  mongoURI: config.mongo.uri,
  redisURI: config.redis.uri,
});

export type { MessageStream, IUser } from "@remoodle/db";
