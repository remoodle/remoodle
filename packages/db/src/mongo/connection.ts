import * as mongoose from "mongoose";
import type { Mongoose } from "mongoose";

export const createMongoDBConnection = async (uri: string) => {
  let connection: Mongoose;

  try {
    connection = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }

  return connection;
};
