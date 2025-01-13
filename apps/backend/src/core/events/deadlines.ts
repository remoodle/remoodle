import type { Deadline } from "@remoodle/types";
import { getTimeLeft } from "@remoodle/utils";

export interface DeadlineReminderDiff {
  courseId: number;
  courseName: string;
  /** [id, name, date, remaining, threshold] */
  deadlines: [number, string, number, string, string][];
}

export interface DeadlineReminderEvent {
  userId: string;
  payload: DeadlineReminderDiff[];
}

const convertThresholdToMs = (value: string): number => {
  const [amount, unit] = value.split(" ");
  const num = parseInt(amount, 10);

  switch (unit.toLowerCase()) {
    case "minute":
    case "minutes":
      return num * 60 * 1000;
    case "hour":
    case "hours":
      return num * 60 * 60 * 1000;
    case "day":
    case "days":
      return num * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
};

const convertThresholds = (thresholds: string[]): number[] => {
  return thresholds.map(convertThresholdToMs).sort((a, b) => a - b);
};

export const calculateRemainingTime = (
  dueDate: number,
  thresholds: string[],
): [string, string] | null => {
  const thresholdsMs = convertThresholds(thresholds);

  const now = Date.now();
  const remainingMs = dueDate - now;

  if (remainingMs <= 0) {
    return null;
  }

  for (let i = 0; i < thresholdsMs.length; i++) {
    if (remainingMs <= thresholdsMs[i]) {
      return [getTimeLeft(dueDate), thresholds[i]];
    }
  }

  return null;
};

export const trackDeadlineReminders = (
  deadlines: Deadline[],
  thresholds: string[],
): DeadlineReminderDiff[] => {
  const diff: DeadlineReminderDiff[] = [];

  for (const deadline of deadlines) {
    const { id, name, timestart, reminders, course } = deadline;

    const dueDate = timestart * 1000; // Convert to milliseconds

    const result = calculateRemainingTime(dueDate, thresholds);

    if (!result) {
      continue;
    }

    const [remaining, threshold] = result;
    // [ '1 day, 00:10:46', '2 days' ]

    if (!reminders[threshold]) {
      continue;
    }

    const existingCourseReminder = diff.find((item) => item.courseId === id);

    if (!existingCourseReminder) {
      diff.push({
        courseId: course.id,
        courseName: course.fullname,
        deadlines: [[id, name, dueDate, remaining, threshold]],
      });
    } else {
      existingCourseReminder.deadlines.push([
        id,
        name,
        dueDate,
        remaining,
        threshold,
      ]);
    }
  }

  return diff;
};

export const formatDeadlineReminders = (
  data: DeadlineReminderDiff[],
): string => {
  let message = "🔔 Upcoming deadlines 🔔\n\n";

  for (const diff of data) {
    message += `🗓 ${diff.courseName}\n`;

    for (const [_id, name, date, remaining, _threshold] of diff.deadlines) {
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
