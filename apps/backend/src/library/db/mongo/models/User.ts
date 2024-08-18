import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";

export type IUser = {
  _id: string;
  name: string;
  handle: string;
  moodleId: number;
  moodleToken: string;
  email?: string;
  telegramId?: number;
  password?: string;
  otp?: string;
  otpExpiry?: string;
};

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser, UserModel>(
  {
    _id: { type: String, default: uuidv7 },
    name: { type: String, required: true },
    handle: { type: String, required: true, unique: true },
    moodleId: { type: Number, required: true, unique: true },
    moodleToken: { type: String, required: true, unique: true },
    email: { type: String },
    telegramId: { type: Number },
    password: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  {
    timestamps: true,
  },
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
