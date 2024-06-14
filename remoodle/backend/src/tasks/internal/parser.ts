import type { ExtendedCourse } from "./types";

export const trackCourseDiff = (
  oldData: ExtendedCourse[],
  newData: ExtendedCourse[],
) => {
  const diffs = [];

  // Create a map for quick lookup of old courses by course_id
  const oldCoursesMap = new Map(
    oldData.map((course) => [course.course_id, course]),
  );

  // Iterate through each course in newData to detect changes
  for (const newCourse of newData) {
    const oldCourse = oldCoursesMap.get(newCourse.course_id);

    if (oldCourse) {
      let courseChanged = false;
      const gradeChanges: any[] = [];

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
            gradeChanges.push({
              name: newGrade.name,
              previous: previous,
              updated: updated,
            });
            courseChanged = true;
          }
        }
      }

      // If any grades changed, push a structured diff for the course
      if (courseChanged) {
        diffs.push({
          course: `${newCourse.name}`,
          grades: gradeChanges,
        });
      }
    } else {
      if (!newCourse.grades) continue;

      // Handle completely new courses
      const gradeChanges = newCourse.grades.map((grade) => ({
        name: grade.name,
        previous: "-",
        updated: grade.graderaw,
      }));
      diffs.push({
        course: `${newCourse.name}`,
        grades: gradeChanges,
      });
    }
  }

  return {
    diffs,
    hasDiff: diffs.length > 0,
  };
};
