import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";

export const DEFAULT_THRESHOLDS = [
  // "3 hours",
  // "6 hours",
  "1 day",
  // "2 days",
  // "3 days",
];

type NotificationSettings = {
  telegram: {
    deadlineReminders: boolean;
    gradeUpdates: boolean;
  };
  deadlineThresholds: string[];
};

export type IUser = {
  _id: string;
  name: string;
  username: string;
  handle: string;
  moodleId: number;
  moodleToken: string;
  notificationSettings: NotificationSettings;
  health: number;
  email?: string;
  telegramId?: number;
  password?: string;
};

type UserModel = Model<IUser>;

const notificationSettingsSchema = new Schema<NotificationSettings>(
  {
    telegram: {
      deadlineReminders: { type: Boolean, default: false },
      gradeUpdates: { type: Boolean, default: true },
    },
    deadlineThresholds: {
      type: [String],
      default: DEFAULT_THRESHOLDS,
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, UserModel>(
  {
    _id: { type: String, default: uuidv7 },
    name: { type: String, required: true },
    username: { type: String, required: true },
    handle: {
      type: String,
      required: true,
      unique: true,
      default() {
        return this._id;
      },
    },
    moodleId: { type: Number, required: true, unique: true },
    moodleToken: { type: String, required: true, unique: true },
    health: { type: Number, default: 7 },
    email: { type: String },
    telegramId: { type: Number },
    password: { type: String },
    notificationSettings: {
      type: notificationSettingsSchema,
      default: {},
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = model("User", userSchema);

export type UserType = typeof User;

export default User;
