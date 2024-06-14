import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { hashPassword, verifyPassword } from "../../../utils/password";

interface IUser {
  _id: string;
  name: string;
  email: string;
  telegramId: number;
  password: string;
  moodleId: number;
}

interface UserMethods {
  verifyPassword: (pass: string) => Promise<boolean>;
}

type UserModel = Model<IUser, UserMethods>;

const userSchema = new Schema<IUser, UserModel, UserMethods>(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String },
    email: { type: String, unique: true },
    telegramId: { type: Number, unique: true },
    moodleId: { type: Number },
    password: { type: String },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { moodleId: 1 },
  { unique: true, partialFilterExpression: { moodleId: { $exists: true } } }
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $exists: true } } }
);

userSchema.index(
  { telegramId: 1 },
  { unique: true, partialFilterExpression: { telegramId: { $exists: true } } }
);

userSchema.methods.verifyPassword = async function (enteredPassword: string) {
  return verifyPassword(enteredPassword, this.password);
};

userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) {
    next();
  }

  this.password = await hashPassword(this.password);
});

const User = model("User", userSchema);

export default User;
