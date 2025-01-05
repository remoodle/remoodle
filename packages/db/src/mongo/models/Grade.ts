import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { IGrade } from "@remoodle/types";

const grade = new Schema<IGrade>(
  {
    _id: { type: String, default: uuidv7 },
    userId: { type: String, required: true, ref: "User" },
    courseId: { type: Number, required: true },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

grade.index({ userId: 1 });

export default model("Grade", grade);
