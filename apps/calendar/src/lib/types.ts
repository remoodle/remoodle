export type ScheduleEventTypes = {
  lecture: boolean;
  practice: boolean;
  learn: boolean;
};

export type ScheduleEventFormats = {
  online: boolean;
  offline: boolean;
};

export type ScheduleFilter = {
  eventTypes: ScheduleEventTypes;
  eventFormats: ScheduleEventFormats;
  excludedCourses: string[];
  ical?: {
    combineAdjacentPairs?: boolean;
    startDate?: string;
    endDate?: string;
  };
};

export type ScheduleItem = {
  id: string;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: string | null;
};

export type Schedule = {
  [group: string]: ScheduleItem[];
};
