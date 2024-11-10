import type { Deadline } from "@remoodle/types";
import type { DeadlineReminderDiff } from "./shims";
import { calculateRemainingTime } from "./thresholds";

export const processDeadlines = (
  deadlines: (Deadline & { notifications: Record<string, boolean> })[],
  thresholds: string[],
): DeadlineReminderDiff[] => {
  const now = Date.now();
  const reminders: DeadlineReminderDiff[] = [];

  for (const deadline of deadlines) {
    const {
      event_id,
      course_name,
      name,
      timestart,
      notifications,
      assignment,
    } = deadline;
    const dueDate = timestart * 1000; // Convert to milliseconds

    // Skip graded and submitted deadlines
    if (
      assignment?.gradeEntity?.graderaw !== null ||
      assignment.submissionEntity?.submitted
    ) {
      continue;
    }

    if (dueDate <= now) {
      continue; // Skip past deadlines
    }

    const [remaining, threshold] = calculateRemainingTime(dueDate, thresholds);

    if (remaining && threshold && !notifications[threshold]) {
      const existingReminder = reminders.find((r) => r.eid === event_id);

      if (existingReminder) {
        existingReminder.deadlines.push([name, dueDate, remaining, threshold]);
      } else {
        reminders.push({
          eid: event_id,
          course: course_name,
          deadlines: [[name, dueDate, remaining, threshold]],
        });
      }
    }
  }

  return reminders;
};
