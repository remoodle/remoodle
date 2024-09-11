import type { GradeChangeDiff, DeadlineReminderDiff } from "./shims";

export const formatCourseDiffs = (data: GradeChangeDiff[]): string => {
  let message = "Updated grades:\n";

  for (const diff of data) {
    message += `\n📘 ${diff.c.split(" | ")[0]}:\n`;
    const gradeChanges = diff.g;
    for (const change of gradeChanges) {
      const [gradeName, previous, updated] = change;
      const displayPrevious = previous === null ? "N/A" : previous;
      const displayUpdated = updated === null ? "N/A" : updated;
      message += `  - ${gradeName}: <b>${displayPrevious} → ${displayUpdated}</b>\n`;
    }
  }

  return message;
};

export const formatDeadlineReminders = (
  data: DeadlineReminderDiff[],
): string => {
  let message = "🔔 Upcoming deadlines 🔔\n\n";

  for (const diff of data) {
    message += `🗓 ${diff.c}\n`;

    for (const [name, date, remaining, _threshold] of diff.d) {
      const formattedDate = new Date(date).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      message += `  - ${name}: ${remaining}, ${formattedDate}\n`;
    }
    message += "\n";
  }

  return message;
};
