import { v4 as uuidv4 } from "uuid";
import { Document, Schema, model } from "mongoose";
import { verifyPassword, hashPassword } from "../../../utils";

interface IUser {
  name: string;
  email: string;
  telegramId: string;
  password: string;
}

interface IUserDoc extends IUser, Document {
  verifyPassword: (pass: string) => Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>(
  {
    _id: { type: String, default: uuidv4() },
    name: { type: String, required: true },
    email: { type: String, unique: true },
    telegramId: { type: String, unique: true },
    password: { type: String },
  },
  {
    timestamps: true,
  }
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
  if (!this.isModified("password")) {
    next();
  }

  this.password = await hashPassword(this.password);
});

const User = model("User", userSchema);

export default User;
