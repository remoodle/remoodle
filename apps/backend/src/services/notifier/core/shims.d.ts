import type { Deadline } from "@remoodle/types";

export type GradeChangeDiff = {
  // course name
  c: string;
  // [name, old, new]
  g: [string, number | null, number | null][];
};

export type GradeChangeEvent = {
  userId: string;
  moodleId: number;
  payload: GradeChangeDiff[];
};

export type DeadlineReminderDiff = {
  // event id
  eid: number;
  // course name
  c: string;
  // course id
  cid: number;
  // [name, date, remaining, __threshold]
  d: [string, number, string, string][];
};

type ProcessDeadlinesResult = {
  reminders: DeadlineReminderDiff[];
  markedDeadlines: (Deadline & { notifications: Record<string, boolean> })[];
};

export type DeadlineReminderEvent = {
  userId: string;
  moodleId: number;
  payload: DeadlineReminderDiff[];
};
