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
  // [name, date, remaining, __threshold]
  d: [string, number, string, string][];
};

export type DeadlineReminderEvent = {
  userId: string;
  moodleId: number;
  payload: DeadlineReminderDiff[];
};
