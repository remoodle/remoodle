import type {
  MoodleAssignment,
  MoodleCourse,
  MoodleCourseClassification,
  MoodleEvent,
  MoodleGrade,
} from "./moodle";

export type ICourse = {
  _id: string;
  userId: string;
  data: MoodleCourse;
  classification: MoodleCourseClassification;
  deleted: boolean;
  notingroup: boolean;
};

export type IGrade = {
  _id: string;
  userId: string;
  courseId: number;
  data: MoodleGrade;
};

export type IEvent = {
  _id: string;
  userId: string;
  data: MoodleEvent;
  reminders: Record<string, boolean> | null;
};

export type NotificationSettings = {
  "gradeUpdates::telegram": 0 | 1 | 2;
  "gradeUpdates::webhook": 0 | 1 | 2;
  "deadlineReminders::telegram": 0 | 1 | 2;
  "deadlineReminders::webhook": 0 | 1 | 2;
};

export type UserSettings = {
  notifications: NotificationSettings;
  webhook: string | null;
  deadlineReminders: {
    thresholds: string[];
  };
};

export type IUser = {
  _id: string;
  name: string;
  moodleId: number;
  username: string;
  handle: string;
  moodleToken: string;
  health: number;
  email?: string;
  telegramId?: number;
  password?: string;
  settings: UserSettings;
};
