import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  telegramId: number;
  password: string;
  moodleId: number;
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    _id: { type: String, default: uuidv7 },
    name: { type: String },
    email: { type: String },
    telegramId: { type: Number },
    moodleId: { type: Number },
    password: { type: String },
  },
  {
    timestamps: true,
  },
);

userSchema.index(
  { moodleId: 1 },
  { unique: true, partialFilterExpression: { moodleId: { $exists: true } } },
);
userSchema.index(
  { telegramId: 1 },
  { unique: true, partialFilterExpression: { telegramId: { $exists: true } } },
);
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } },
);

const User = model("User", userSchema);

export type UserType = typeof User;

export default User;
