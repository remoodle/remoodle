import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { ICourse } from "@remoodle/types";

const course = new Schema<ICourse>(
  {
    _id: { type: String, default: uuidv7 },
    userId: { type: String, required: true, ref: "User" },
    data: { type: Schema.Types.Mixed, required: true },
    classification: { type: String, required: true },
    deleted: { type: Boolean, default: false },
    notingroup: { type: Boolean, default: false },
  },
  { timestamps: true },
);

course.index({ userId: 1 });

export default model("Course", course);
