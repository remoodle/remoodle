import { DB } from "@remoodle/db";
import { config } from "../../config";

export const db = new DB({
  redisURI: config.redis.uri,
});
