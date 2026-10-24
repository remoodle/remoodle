import type { Temporal } from "temporal-polyfill";
import type { CalendarEvent, EventKind } from "@/lib/calendar-events";

type DemoEntry = [
  day: number,
  from: string,
  to: string,
  kind: EventKind,
  title: string,
  location: string,
];

// A believable AITU week for the hero pane. Days are offsets from Monday.
const entries: DemoEntry[] = [
  [0, "09:00", "10:50", "lecture", "Algorithms and data structures", "C1.2.248"],
  [0, "11:00", "11:50", "practice", "Calculus II", "C1.3.361"],
  [1, "10:00", "11:50", "online", "Databases", "Online"],
  [1, "13:00", "14:50", "practice", "Algorithms and data structures", "C1.1.239"],
  [2, "09:00", "10:50", "lecture", "Computer networks", "Main hall"],
  [2, "12:00", "12:50", "practice", "English for IT", "C1.3.255"],
  [3, "11:00", "12:50", "lecture", "Databases", "C1.2.248"],
  [3, "14:00", "15:50", "online", "Computer networks", "Online"],
  [4, "10:00", "11:50", "practice", "Calculus II", "C1.3.361"],
];

export function demoWeek(monday: Temporal.PlainDate): CalendarEvent[] {
  const classes = entries.map(([day, from, to, kind, title, location], index) => {
    const date = monday.add({ days: day });

    return {
      id: `demo-${index}`,
      kind,
      title,
      start: date.toPlainDateTime(from),
      end: date.toPlainDateTime(to),
      dateRow: false,
      deadline: null,
      location,
      details: [kind === "lecture" ? "Lecture" : "Practice"],
    };
  });

  const due = monday.add({ days: 3 }).toPlainDateTime("23:59");
  const quiz = monday.add({ days: 1 }).toPlainDateTime("18:00");

  return [
    ...classes,
    {
      id: "demo-due",
      kind: "assignment",
      title: "Lab 4 is due",
      start: due,
      end: due,
      dateRow: true,
      deadline: "23:59",
      location: "",
      details: ["Algorithms and data structures"],
    },
    {
      id: "demo-quiz",
      kind: "quiz",
      title: "Quiz 3 closes",
      start: quiz,
      end: quiz,
      dateRow: true,
      deadline: "18:00",
      location: "",
      details: ["Databases"],
    },
  ];
}
