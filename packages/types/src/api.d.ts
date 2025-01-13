import type {
  MoodleEvent,
  MoodleGrade,
  MoodleAssignment,
  MoodleCourse,
  MoodleCourseContent,
} from "./moodle";

export type APIError = {
  status: number;
  message: string;
};

export type APIErrorResponse = {
  error: APIError;
};

export type APIWrapper<T> = T | APIErrorResponse;

export type Course = MoodleCourse & {
  content?: MoodleCourseContent[];
};

export type ExtendedCourse = Course & {
  grades?: MoodleGrade[];
};
