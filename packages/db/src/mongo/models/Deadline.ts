import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { Deadline as RMDeadline } from "@remoodle/types";

export type DeadlineData = RMDeadline & {
  notifications: Record<string, boolean>;
};

export type IDeadline = {
  _id: string;
  userId: string;
  data: DeadlineData[];
  fetchedAt: Date;
};

type CourseModel = Model<IDeadline>;

const courseSchema = new Schema<IDeadline, CourseModel>(
  {
    _id: { type: String, default: uuidv7 },
    userId: { type: String, required: true, ref: "User" },
    data: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

const Deadline = model("Deadline", courseSchema);

export type DeadlineType = typeof Deadline;

export default Deadline;
