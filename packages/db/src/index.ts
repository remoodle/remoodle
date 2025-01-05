import { createMongoDBConnection } from "./mongo/connection";
import course from "./mongo/models/Course";
import event from "./mongo/models/Event";
import grade from "./mongo/models/Grade";
import user from "./mongo/models/User";

import { createRedisConnection } from "./redis/connection";
import TelegramToken from "./redis/models/TelegramToken";

export const createRedis = (redisURI: string) => {
  const redisConnection = createRedisConnection(redisURI);

  const telegramToken = new TelegramToken(redisConnection);

  return {
    redisConnection,
    telegramToken,
  };
};

export const createMongo = (mongoURI: string) => {
  createMongoDBConnection(mongoURI);

  return {
    course,
    event,
    grade,
    user,
  };
};

// TODO: SCLIE UP
export const createDB = ({
  mongoURI,
  redisURI,
}: {
  mongoURI?: string;
  redisURI: string;
}) => {
  if (mongoURI) {
    createMongoDBConnection(mongoURI);
  }

  const redisConnection = createRedisConnection(redisURI);

  const telegramToken = new TelegramToken(redisConnection);

  return {
    user,
    course,
    event,
    grade,
    telegramToken,
    redisConnection,
  };
};
