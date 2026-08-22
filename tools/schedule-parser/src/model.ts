import type { DuLesson } from "./schemas.js";

export type GroupScheduleItem = {
  id: string;
  start: string;
  end: string;
  courseName: string;
  location: string;
  isOnline: boolean;
  teacher: string;
  type: string | null;
};

export function formatLesson(lesson: DuLesson): GroupScheduleItem | undefined {
  const dayIndex = lesson.days.days.findIndex(
    (day) => day === lesson.classtime_day,
  );
  const weekDay = lesson.days.daysname[dayIndex];
  const time = lesson.days.time.find(
    (candidate) => candidate.id === lesson.classtime_time,
  );

  if (!weekDay || !time) return undefined;

  return {
    id: crypto.randomUUID(),
    start: `${weekDay} ${time.start}`,
    end: `${weekDay} ${time.finish}`,
    courseName: lesson.subject,
    location: lesson.room,
    isOnline: lesson.room === "online",
    teacher: lesson.tutor,
    type: lesson.lesson_type,
  };
}
