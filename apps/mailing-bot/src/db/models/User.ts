import type { Model } from "mongoose";
import { Schema, model } from "mongoose";

interface IUser {
  telegramId: number;
  role: "admin" | "user";
}

type UserModel = Model<IUser>;

const userSchema = new Schema<IUser & UserModel>(
  {
    telegramId: { type: Number, required: true, unique: true },
    role: { type: String, required: true },
  },
  { _id: false },
);

userSchema.index(
  { telegramId: 1 },
  { partialFilterExpression: { telegramId: { $exists: true } } },
);

const User = model("User", userSchema);

export { User };
