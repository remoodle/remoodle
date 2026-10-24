import type { MoodleEvent } from "./events";

export type DeadlineEvent = {
  uid: string;
  summary: string;
  timestampMs: number;
  courseName?: string;
  description?: string;
};

export function moodleToDeadlineEvents(events: MoodleEvent[]): DeadlineEvent[] {
  return events.flatMap((event) =>
    event.kind === "attendance"
      ? []
      : [
          {
            // Match the upstream UIDs already recorded in reminder history.
            uid: event.id.slice("moodle-".length),
            summary: event.title,
            timestampMs: Date.parse(
              event.allDay ? event.start + "T00:00:00+05:00" : event.start + "+05:00",
            ),
            courseName: event.courseName,
            description: event.description,
          },
        ],
  );
}
