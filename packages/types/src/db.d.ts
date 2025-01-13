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
  telegram: {
    deadlineReminders: boolean;
    gradeUpdates: boolean;
  };
  deadlineThresholds: string[];
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
  notificationSettings: NotificationSettings;
};
