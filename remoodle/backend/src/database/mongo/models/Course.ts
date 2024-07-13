import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { ExtendedCourse } from "../../../shims";

export interface ICourse {
  _id: string;
  userId: string;
  data: ExtendedCourse[];
  fetchedAt: Date;
}

type CourseModel = Model<ICourse>;

const courseSchema = new Schema<ICourse, CourseModel>(
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

const Course = model("Course", courseSchema);

export type CourseType = typeof Course;

export default Course;
