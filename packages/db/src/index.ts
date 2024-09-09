import { createMongoDBConnection } from "./mongo/connection";
import Course from "./mongo/models/Course";
import Deadline from "./mongo/models/Deadline";
import User from "./mongo/models/User";

import { createRedisConnection } from "./redis/connection";
import TelegramToken from "./redis/models/TelegramToken";

export type { IUser } from "./mongo/models/User";
export type { ICourse } from "./mongo/models/Course";
export type { IDeadline } from "./mongo/models/Deadline";

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
    user: User,
    course: Course,
    deadline: Deadline,
    redisConnection,
    telegramToken,
  };
};
