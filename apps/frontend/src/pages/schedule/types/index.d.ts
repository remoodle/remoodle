export type ScheduleItem = {
  id: string;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: string;
};

export type Schedule = {
  [group: string]: ScheduleItem[];
};
