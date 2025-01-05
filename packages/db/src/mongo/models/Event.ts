import { Schema, model } from "mongoose";
import { v7 as uuidv7 } from "uuid";
import type { IEvent } from "@remoodle/types";

const event = new Schema<IEvent>(
  {
    _id: { type: String, default: uuidv7 },
    userId: { type: String, required: true, ref: "User" },
    data: { type: Schema.Types.Mixed, required: true },
    reminders: { type: Schema.Types.Mixed, required: true, default: null },
  },
  { timestamps: true },
);

event.index({ userId: 1 });

export default model("Event", event);
