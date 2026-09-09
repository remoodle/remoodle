export type MoodleEvent = {
  id: string;
  title: string;
  description: string;
  courseName: string;
  start: string;
  end: string;
  allDay: boolean;
  kind: "attendance" | "assignment" | "other";
};

export const moodleKinds = {
  attendance: "Attendance",
  assignment: "Assignments",
  other: "Quizzes and other events",
} as const;

export type MoodleFilters = Record<MoodleEvent["kind"], boolean>;
export const defaultMoodleFilters = (): MoodleFilters => ({
  attendance: false,
  assignment: true,
  other: true,
});

export function filterMoodle(events: MoodleEvent[], filters = defaultMoodleFilters()) {
  return events.filter((event) => filters[event.kind]);
}

export function moodleToIcalEvents(events: MoodleEvent[]) {
  return events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    description: [event.courseName, event.description].filter(Boolean).join("\n\n"),
    location: "",
    allDay: event.allDay,
  }));
}
