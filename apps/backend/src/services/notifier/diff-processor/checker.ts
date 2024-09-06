import type { ExtendedCourse } from "@remoodle/types";
import type { GradeChangeDiff } from "./shims";

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

    if (oldCourse) {
      const oldGradesMap = new Map(
        oldCourse.grades?.map((grade) => [grade.grade_id, grade]),
      );

      if (newCourse.grades) {
        for (const newGrade of newCourse.grades) {
          const oldGrade = oldGradesMap.get(newGrade.grade_id);
          const previous = oldGrade ? oldGrade.graderaw : null;
          const updated = newGrade.graderaw;

          // eslint-disable-next-line max-depth
          if (!oldGrade || previous !== updated) {
            courseChanges.push([newGrade.name, previous, updated]);
          }
        }
      }

      if (courseChanges.length > 0) {
        diffs.push({ c: newCourse.name, g: courseChanges });
      }
    } else {
      if (!newCourse.grades) {
        continue;
      }

      courseChanges = newCourse.grades.map((grade) => [
        grade.name,
        null,
        grade.graderaw,
      ]);
      diffs.push({ c: newCourse.name, g: courseChanges });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};
