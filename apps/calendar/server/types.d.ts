export type GroupScheduleItem = {
  id: string;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: "lecture" | "practice";
};

export type ScheduleFilter = {
  eventTypes: {
    lecture: boolean;
    practice: boolean;
    learn: boolean;
  };
  eventFormats: {
    online: boolean;
    offline: boolean;
  };
  excludedCourses: string[];
  ical?: {
    combineAdjacentPairs?: boolean;
    startDate?: string;
    endDate?: string;
  };
};

export type GroupSchedule = GroupScheduleItem[];

export type Groups = string[];
