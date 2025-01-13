import TelegramToken from "./models/TelegramToken";
import { createRedisConnection } from "./connection";

export const createRedis = (redisURI: string) => {
  const redisConnection = createRedisConnection(redisURI);

  const telegramToken = new TelegramToken(redisConnection);

  return {
    redisConnection,
    telegramToken,
  };
};
