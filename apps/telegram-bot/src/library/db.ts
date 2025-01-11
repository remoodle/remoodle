import { createRedis } from "@remoodle/db";
import { config } from "../config";

const redis = createRedis(config.redis.uri);

export const db = {
  ...redis,
};
