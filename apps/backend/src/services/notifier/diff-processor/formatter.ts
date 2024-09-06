import type { GradeChangeDiff, DeadlineReminderDiff } from "./shims";

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

export const formatDeadlineReminders = (
  data: DeadlineReminderDiff[],
): string => {
  let message = "Upcoming deadlines:\n\n";

  for (const diff of data) {
    message += `  ${diff.c}:\n`;
    for (const [name, date, remaining, threshold] of diff.d) {
      const formattedDate = new Date(date).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      message += `      ${name}\n      ${formattedDate}\n      Remaining: ${remaining}\n`;
      message += `      ___threshold: ${threshold}\n\n`;
    }
  }

  return message;
};
