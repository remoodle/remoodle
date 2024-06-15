import type { CourseDiff, ExtendedCourse } from "../shims";

export const trackCourseDiff = (
  oldData: ExtendedCourse[],
  newData: ExtendedCourse[],
) => {
  const diffs: CourseDiff[] = [];

  const oldCoursesMap = new Map(
    oldData.map((course) => [course.course_id, course]),
  );

  for (const newCourse of newData) {
    const oldCourse = oldCoursesMap.get(newCourse.course_id);
    let courseChanges: [
      string,
      string | number | null,
      string | number | null,
    ][] = [];

    if (oldCourse) {
      const oldGradesMap = new Map(
        oldCourse.grades?.map((grade) => [grade.grade_id, grade]),
      );

      if (newCourse.grades) {
        for (const newGrade of newCourse.grades) {
          const oldGrade = oldGradesMap.get(newGrade.grade_id);
          const previous = oldGrade ? oldGrade.graderaw : "-";
          const updated = newGrade.graderaw;

          if (!oldGrade || previous !== updated) {
            courseChanges.push([newGrade.name, previous, updated]);
          }
        }
      }

      if (courseChanges.length > 0) {
        diffs.push({ n: newCourse.name, d: courseChanges });
      }
    } else {
      if (!newCourse.grades) continue;

      courseChanges = newCourse.grades.map((grade) => [
        grade.name,
        "-",
        grade.graderaw,
      ]);
      diffs.push({ n: newCourse.name, d: courseChanges });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};

export const formatCourseDiffs = (data: CourseDiff[]) => {
  let message = "Updated grades:\n\n";

  for (const diff of data) {
    message += `  ${diff.n}:\n`;
    const gradeChanges = diff.d;
    for (const change of gradeChanges) {
      const [gradeName, previous, updated] = change;
      const displayPrevious = previous === null ? "-" : previous;
      const displayUpdated = updated === null ? "-" : updated;
      message += `      ${gradeName} ${displayPrevious} -> ${displayUpdated}\n`;
    }
  }

  return message;
};
