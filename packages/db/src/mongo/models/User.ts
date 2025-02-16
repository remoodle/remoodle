import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { IUser, NotificationSettings } from "@remoodle/types";

export const DEFAULT_THRESHOLDS = [
  "3 hours",
  "6 hours",
  "1 day",
  // "2 days",
  // "3 days",
];

const notificationSettingsSchema = new Schema<NotificationSettings>(
  {
    "deadlineReminders::telegram": {
      type: Number,
      default: 0,
      min: 0,
      max: 2,
    },
    "gradeUpdates::telegram": {
      type: Number,
      default: 1,
      min: 0,
      max: 2,
    },
  },
  { _id: false },
);

const deadlineRemindersSchema = new Schema(
  {
    thresholds: {
      type: [String],
      default: DEFAULT_THRESHOLDS,
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
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
    telegramId: { type: Number },
    password: { type: String },
    settings: {
      notifications: {
        type: notificationSettingsSchema,
        default: {},
        required: true,
      },
      deadlineReminders: {
        type: deadlineRemindersSchema,
        default: {},
        required: true,
      },
    },
  },
  { timestamps: true },
);

userSchema.index(
  { telegramId: 1 },
  { unique: true, partialFilterExpression: { telegramId: { $exists: true } } },
);

export default model("User", userSchema);
