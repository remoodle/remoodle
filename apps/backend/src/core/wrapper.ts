import { db } from "../library/db";

export const deleteUser = async (userId: string) => {
  await db.user.deleteOne({ _id: userId });
  await db.course.deleteMany({ userId });
  await db.grade.deleteMany({ userId });
  await db.event.deleteMany({ userId });
};
