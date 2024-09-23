import IORedis from "ioredis";

export const createRedisConnection = (uri: string) => {
  return new IORedis(uri, {
    maxRetriesPerRequest: null,
  });
};
