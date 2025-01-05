import type { Deadline } from "@remoodle/types";
import { db } from "../library/db";

export async function getDeadlines(
  userId: string,
  options?: { courseId?: number; daysLimit?: number },
): Promise<Deadline[]> {
  const { courseId = null, daysLimit = null } = options || {};

  const events = await db.event
    .find({
      userId,
      ...(courseId && { "course.id": courseId }),

      /**
       * TODO: Add timestart TTL (maybe)
       * Query after timestart to filter out events that are already past
       * Also add daysLimit to filter out events that are older than daysLimit
       */
      "data.timestart": {
        $gt: Date.now() / 1000,
        ...(daysLimit && {
          $lte: Date.now() / 1000 + daysLimit * 24 * 60 * 60,
        }),
      },

      /**
       * not component: "mod_attendance"
       * "data.component": "mod_assign", doesn't fit because there is also "mod_quiz"
       */
      "data.component": { $ne: "mod_attendance" },
    })
    .lean();

  const deadlines = events.map((event) => ({
    ...event.data,
    reminders: event.reminders || {},
  }));

  return deadlines;
}

export const deleteUser = async (userId: string) => {
  await db.user.deleteOne({ _id: userId });
  await db.course.deleteMany({ userId });
  await db.grade.deleteMany({ userId });
  await db.event.deleteMany({ userId });
};
