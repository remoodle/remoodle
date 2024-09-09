import { createDB } from "@remoodle/db";
import { config } from "../../config";

export const db = createDB({
  redisURI: config.redis.uri,
});
