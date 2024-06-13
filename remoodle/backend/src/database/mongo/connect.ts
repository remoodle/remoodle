import * as mongoose from "mongoose";
import { config } from "../../config";

export const connectDB = async () => {
  try {
    if (config.mongo.uri !== undefined) {
      const conn = await mongoose.connect(config.mongo.uri, {
        autoIndex: true,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};
