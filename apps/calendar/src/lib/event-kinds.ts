import type { EventKind } from "./calendar-events";

// Classes are literal so Tailwind sees them; colours are the DESIGN.md event calendars.
export const eventKinds = {
  lecture: {
    label: "Lectures",
    fill: "bg-event-lecture-soft text-event-lecture",
    dot: "bg-event-lecture",
  },
  online: {
    label: "Online classes",
    fill: "bg-event-online-soft text-event-online",
    dot: "bg-event-online",
  },
  practice: {
    label: "In-person practice",
    fill: "bg-event-practice-soft text-event-practice",
    dot: "bg-event-practice",
  },
  assignment: {
    label: "Assignments",
    fill: "bg-event-assignment-soft text-event-assignment",
    dot: "bg-event-assignment",
  },
  quiz: {
    label: "Quizzes and events",
    fill: "bg-event-quiz-soft text-event-quiz",
    dot: "bg-event-quiz",
  },
  attendance: {
    label: "Attendance",
    fill: "bg-event-attendance-soft text-event-attendance",
    dot: "bg-event-attendance",
  },
} as const satisfies Record<EventKind, { label: string; fill: string; dot: string }>;

// The CSS variable that holds each kind's ink and soft fill, for canvas drawing.
export const eventKindVariables = {
  lecture: "--event-lecture",
  online: "--event-online",
  practice: "--event-practice",
  assignment: "--event-assignment",
  quiz: "--event-quiz",
  attendance: "--event-attendance",
} as const satisfies Record<EventKind, string>;
