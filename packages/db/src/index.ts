import { createMongoDBConnection } from "./mongo/connection";
import Course, { type CourseType } from "./mongo/models/Course";
import User, { type UserType } from "./mongo/models/User";

import { createRedisConnection } from "./redis/connection";
import MessageStream from "./redis/models/MessageStream";
import TelegramToken from "./redis/models/TelegramToken";

export type { MessageStream, TelegramToken };

export type { IUser } from "./mongo/models/User";
export type { ICourse } from "./mongo/models/Course";

export class DB {
  user: UserType;
  course: CourseType;

  messageStream: MessageStream;
  telegramToken: TelegramToken;

  constructor({
    mongoURI,
    redisURI,
  }: {
    mongoURI?: string;
    redisURI?: string;
  }) {
    this.user = User;
    this.course = Course;
    if (mongoURI) {
      createMongoDBConnection(mongoURI);
    }

    const redisConnection = redisURI ? createRedisConnection(redisURI) : null;
    this.messageStream = (
      redisConnection ? new MessageStream(redisConnection) : null
    ) as MessageStream;
    this.telegramToken = (
      redisConnection ? new TelegramToken(redisConnection) : null
    ) as TelegramToken;
  }
}
