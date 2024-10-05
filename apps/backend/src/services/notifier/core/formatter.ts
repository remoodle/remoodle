import type { GradeChangeDiff, DeadlineReminderDiff } from "./shims";

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
    message += `\n📘 ${diff.course.split(" | ")[0]}:\n`;
    const gradeChanges = diff.grades;
    for (const change of gradeChanges) {
      const [gradeName, previous, updated, max] = change;
      message += `  • ${gradeName}: <b>${formatGrade(previous)} → ${formatGrade(updated)}</b>${formatPostfix(max)}\n`;
    }
  }

  return message;
};

export const formatDeadlineReminders = (
  data: DeadlineReminderDiff[],
): string => {
  let message = "🔔 Upcoming deadlines 🔔\n\n";

  for (const diff of data) {
    message += `🗓 ${diff.course}\n`;

    for (const [name, date, remaining, _threshold] of diff.deadlines) {
      const formattedDate = new Date(date).toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Almaty",
      });
      message += `  • ${name}: <b>${remaining}</b>, ${formattedDate}\n`;
    }
    message += "\n";
  }

  return message;
};
