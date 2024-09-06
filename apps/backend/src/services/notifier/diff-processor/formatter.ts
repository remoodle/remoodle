import type { GradeChangeDiff } from "./shims";

export const formatCourseDiffs = (data: GradeChangeDiff[]): string => {
  let message = "Updated grades:\n\n";

  for (const diff of data) {
    message += `  ${diff.c}:\n`;
    const gradeChanges = diff.g;
    for (const change of gradeChanges) {
      const [gradeName, previous, updated] = change;
      const displayPrevious = previous === null ? "-" : previous;
      const displayUpdated = updated === null ? "-" : updated;
      message += `      ${gradeName} ${displayPrevious} -> ${displayUpdated}\n`;
    }
  }

  return message;
};
