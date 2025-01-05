import { createRedis, createMongo } from "@remoodle/db";
import { config } from "../config";

const redis = createRedis(config.redis.uri);
const mongo = createMongo(config.mongo.uri);

export const db = {
  ...redis,
  ...mongo,
};
