import type { CourseDiff } from "./types";

export const formatCourseDiffs = (data: CourseDiff[]): string => {
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
