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
