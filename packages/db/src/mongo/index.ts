import course from "./models/Course";
import event from "./models/Event";
import grade from "./models/Grade";
import user from "./models/User";
import { createMongoDBConnection } from "./connection";

export const createMongo = (mongoURI: string) => {
  createMongoDBConnection(mongoURI);

  return {
    course,
    event,
    grade,
    user,
  };
};
