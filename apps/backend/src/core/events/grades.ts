import type { MoodleGrade } from "@remoodle/types";

export interface GradeChangeDiff {
  courseId: number;
  courseName: string;
  /** [name, old, new, max] */
  changes: [string, number | null, number | null, number][];
}

export interface GradeChangeEvent {
  userId: string;
  payload: GradeChangeDiff[];
}

export const trackCourseDiff = (
  oldGrades: MoodleGrade[],
  newGrades: MoodleGrade[],
): GradeChangeDiff["changes"] => {
  const oldGradesMap = new Map(oldGrades.map((item) => [item.id, item]));

  let diff: GradeChangeDiff["changes"] = [];

  for (const newGrade of newGrades) {
    if (!newGrade.itemname.trim()) {
      continue; // Skip grades with empty names
    }
    const oldGrade = oldGradesMap.get(newGrade.id);

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
      diff.push([
        newGrade.itemname,
        previous,
        updated ?? null,
        newGrade.grademax,
      ]);
    }
  }

  return diff;
};

const formatGrade = (num: number | null) => {
  if (num === null) {
    return "N/A";
  }
  return num.toFixed(2).replace(/\.0+$/, "");
};

const formatPostfix = (max: number) => {
  return max !== 100 ? ` (out of ${max})` : "";
};

export const formatCourseDiffs = (data: GradeChangeDiff[]): string => {
  let message = "Updated grades:\n";

  for (const diff of data) {
    message += `\n📘 ${diff.courseName.split(" | ")[0]}:\n`;
    const gradeChanges = diff.changes;
    for (const change of gradeChanges) {
      const [gradeName, previous, updated, max] = change;
      message += `  • ${gradeName}: <b>${formatGrade(previous)} → ${formatGrade(updated)}</b>${formatPostfix(max)}\n`;
    }
  }

  return message;
};
