import { config } from "../config";
import { createMongoDBConnection } from "./mongo/connection";
import Course, { type CourseType } from "./mongo/models/Course";
import User, { type UserType } from "./mongo/models/User";
import { createRedisConnection } from "./redis/connection";
import MessageStream from "./redis/models/MessageStream";

class DB {
  user: UserType;
  course: CourseType;
  messageStream: MessageStream;

  constructor() {
    this.user = User;
    this.course = Course;

    createMongoDBConnection(config.mongo.uri);

    const redisConnection = createRedisConnection(config.redis.uri);

    this.messageStream = new MessageStream(redisConnection);
  }
}

export const db = new DB();

export type { DB };
