export type CourseDiff = {
  n: string;
  d: [string, number | null, number | null][];
};

export type GradeChangeEvent = {
  userId: string;
  moodleId: number;
  payload: CourseDiff[];
};
