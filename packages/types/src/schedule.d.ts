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
    selectedGroup: string;
    eventTypes: ScheduleEventTypes;
    eventFormats: ScheduleEventFormats;
    excludedCourses: string[];
};

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
