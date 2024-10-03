import type { Model } from "mongoose";
import { Schema, model } from "mongoose";

interface IGroup {
  name: string;
  telegramId: number;
  ownerId: number;
}

type GroupModel = Model<IGroup>;

const groupSchema = new Schema<IGroup & GroupModel>(
  {
    name: { type: String, required: true, unique: true },
    telegramId: { type: Number, required: true, unique: true },
    ownerId: { type: Schema.Types.Number, ref: "User", required: true },
  },
  { timestamps: true, _id: false },
);

groupSchema.index(
  { telegramId: 1 },
  { partialFilterExpression: { telegramId: { $exists: true } } },
);

const Group = model("Group", groupSchema);

export { Group };
