import type { GradeChangeEvent, CourseDiff, ExtendedCourse } from "../shims";

export const trackCourseDiff = (
  oldData: ExtendedCourse[],
  newData: ExtendedCourse[],
) => {
  const diffs: CourseDiff[] = [];

  // Create a map for quick lookup of old courses by course_id
  const oldCoursesMap = new Map(
    oldData.map((course) => [course.course_id, course]),
  );

  // Iterate through each course in newData to detect changes
  for (const newCourse of newData) {
    const oldCourse = oldCoursesMap.get(newCourse.course_id);
    let courseChanges: any[] = [];

    if (oldCourse) {
      // Create a map for quick lookup of old grades by grade_id
      const oldGradesMap = new Map(
        oldCourse.grades?.map((grade) => [grade.grade_id, grade]),
      );

      // Check each grade in newCourse for changes
      if (newCourse.grades) {
        for (const newGrade of newCourse.grades) {
          const oldGrade = oldGradesMap.get(newGrade.grade_id);
          const previous = oldGrade ? oldGrade.graderaw : "-";
          const updated = newGrade.graderaw;

          // Check if the grade exists and if it has changed
          if (!oldGrade || previous !== updated) {
            courseChanges.push([newGrade.name, previous, updated]);
          }
        }
      }

      // If any grades changed, push a structured diff for the course
      if (courseChanges.length > 0) {
        diffs.push({
          [newCourse.name]: courseChanges,
        });
      }
    } else {
      if (!newCourse.grades) continue;

      // Handle completely new courses
      courseChanges = newCourse.grades.map((grade) => [
        grade.name,
        "-",
        grade.graderaw,
      ]);
      diffs.push({
        [newCourse.name]: courseChanges,
      });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};

export const formatCourseDiffs = (data: GradeChangeEvent["payload"]) => {
  let message = "Updated grades:\n\n";

  for (const diff of data) {
    for (const course in diff) {
      message += `  ${course}:\n`;
      const gradeChanges = diff[course];
      for (const change of gradeChanges) {
        const [gradeName, previous, updated] = change;
        const displayPrevious = previous === null ? "-" : previous;
        const displayUpdated = updated === null ? "-" : updated;
        message += `      ${gradeName} ${displayPrevious} -> ${displayUpdated}\n`;
      }
    }
  }

  return message;
};
