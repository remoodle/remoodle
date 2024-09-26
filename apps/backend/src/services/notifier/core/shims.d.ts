export type GradeChangeDiff = {
  course: string;
  courseId: number;
  // [name, old, new]
  grades: [string, number | null, number | null][];
};

export type GradeChangeEvent = {
  moodleId: number;
  payload: GradeChangeDiff[];
};

export type DeadlineReminderDiff = {
  // event id
  eid: number;
  course: string;
  // [name, date, remaining, __threshold]
  deadlines: [string, number, string, string][];
};

export type DeadlineReminderEvent = {
  moodleId: number;
  payload: DeadlineReminderDiff[];
};
