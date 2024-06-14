import type { Model } from "mongoose";
import { Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface ICourse {
  _id: string;
  userId: string;
  data: any;
  fetchedAt: Date;
}

type CourseModel = Model<ICourse>;

const courseSchema = new Schema<ICourse, CourseModel>(
  {
    _id: { type: String, default: uuidv4 },
    userId: { type: String, required: true, ref: "User" },
    data: { type: Schema.Types.Mixed, required: true },
    fetchedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

const Course = model("Course", courseSchema);

export default Course;
