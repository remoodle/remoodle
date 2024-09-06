import { createMongoDBConnection } from "./mongo/connection";
import Course, { type CourseType } from "./mongo/models/Course";
import Deadline, { type DeadlineType } from "./mongo/models/Deadline";
import User, { type UserType } from "./mongo/models/User";

import { createRedisConnection } from "./redis/connection";
import MessageStream from "./redis/models/MessageStream";
import TelegramToken from "./redis/models/TelegramToken";

export type { MessageStream, TelegramToken };

export type { IUser } from "./mongo/models/User";
export type { ICourse } from "./mongo/models/Course";
export type { IDeadline } from "./mongo/models/Deadline";

export class DB {
  user: UserType;
  course: CourseType;
  deadline: DeadlineType;

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
    this.deadline = Deadline;

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
