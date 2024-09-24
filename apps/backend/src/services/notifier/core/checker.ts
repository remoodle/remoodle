import type { ExtendedCourse, Deadline } from "@remoodle/types";
import type { GradeChangeDiff, DeadlineReminderDiff } from "./shims";
import { calculateRemainingTime } from "./thresholds";

export const trackCourseDiff = (
  oldData: ExtendedCourse[],
  newData: ExtendedCourse[],
): {
  hasDiff: boolean;
  diffs: GradeChangeDiff[];
} => {
  const diffs: GradeChangeDiff[] = [];

  const oldCoursesMap = new Map(
    oldData.map((course) => [course.course_id, course]),
  );

  for (const newCourse of newData) {
    const oldCourse = oldCoursesMap.get(newCourse.course_id);
    let courseChanges: [string, number | null, number | null][] = [];

    const newGrades = newCourse.grades || [];

    for (const newGrade of newGrades) {
      if (!newGrade.name.trim()) {
        continue; // Skip grades with empty names
      }

      const oldGrade = oldCourse
        ? oldCoursesMap
            .get(newCourse.course_id)
            ?.grades?.find((g) => g.grade_id === newGrade.grade_id)
        : undefined;
      const previous = oldGrade?.graderaw ?? null;
      const updated = newGrade.graderaw;

      // Explicitly ignore differences between null and 0
      if (
        (previous === null && updated === 0) ||
        (previous === 0 && updated === null)
      ) {
        continue;
      }

      // Ignore if both values are null
      if (previous === null && updated === null) {
        continue;
      }

      if (!oldGrade || previous !== updated) {
        courseChanges.push([newGrade.name, previous, updated]);
      }
    }

    if (courseChanges.length > 0) {
      diffs.push({ c: newCourse.name, g: courseChanges });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};

export const processDeadlines = (
  deadlines: (Deadline & { notifications: Record<string, boolean> })[],
  thresholds: string[],
): DeadlineReminderDiff[] => {
  const now = Date.now();
  const reminderMap: Record<number, DeadlineReminderDiff> = {};

  const eligibleDeadlines = deadlines.filter(
    (deadline) =>
      !deadline.assignment?.gradeEntity?.graderaw &&
      deadline.timestart * 1000 > now,
  );

  for (const deadline of eligibleDeadlines) {
    const { event_id, course_id, course_name, name, timestart, notifications } =
      deadline;
    const dueDate = timestart * 1000; // Convert to milliseconds

    const [remaining, threshold] = calculateRemainingTime(dueDate, thresholds);

    if (remaining && threshold && !notifications[threshold]) {
      if (!reminderMap[course_id]) {
        reminderMap[course_id] = {
          cid: course_id,
          eid: event_id,
          c: course_name,
          d: [],
        };
      }
      reminderMap[course_id].d.push([name, dueDate, remaining, threshold]);
    }
  }

  return Object.values(reminderMap);
};
