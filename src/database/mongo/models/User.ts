import { Document, Schema, model } from "mongoose";
import { verifyPassword, hashPassword } from "../../../utils";

interface IUser {
  name: string;
  email: string;
  password: string;
}

interface IUserDoc extends IUser, Document {
  verifyPassword: (pass: string) => Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
  }
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
