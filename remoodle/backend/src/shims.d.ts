// API
export type ActiveCourse = {
  course_id: number;
  name: string;
  coursecategory: string;
  url: string;
  start_date: number;
  end_date: number;
};

export type Grade = {
  id: number;
  grade_id: number;
  cmid: number;
  name: string;
  percentage: number | null;
  itemtype: string;
  itemmodule: string;
  iteminstance: number;
  grademin: number;
  grademax: number;
  feedbackformat: 1 | 0;
  graderaw: number | null;
  feedback: string;
};

export type ExtendedCourse = ActiveCourse & {
  grades?: Grade[];
};

// Crawler
export type CourseDiff = Record<string, [string, string, string][]>;

export type GradeChangeEvent = {
  moodleId: number;
  payload: CourseDiff[];
};
