import { Temporal } from "temporal-polyfill";
import type { ScheduleItem } from "../../../shared/schedule";
import { parseMyDuResponse, scheduleWeekSchema } from "./schemas";

type ScheduleSettings = { studyYear: number; term: number; firstWeekStart: string };

export function normalizeWeek(
  value: Parameters<typeof parseMyDuResponse>[1],
  settings: ScheduleSettings,
  week: number,
): ScheduleItem[] {
  const data = parseMyDuResponse(scheduleWeekSchema, value);

  if (
    data.studyYear !== settings.studyYear ||
    data.term !== settings.term ||
    data.weekNumber !== week
  ) {
    throw new Error("My DU returned a different academic week.");
  }

  const monday = Temporal.PlainDate.from(settings.firstWeekStart).add({ weeks: week - 1 });

  return data.slots.flatMap((slot) => {
    const date = monday.add({ days: slot.weekDay.id - 1 }).toString();

    return slot.items.map((item): ScheduleItem => {
      const match = item.classTime.title.match(/^(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})$/);

      if (!match) throw new Error("Unexpected My DU lesson time.");

      const start = Temporal.PlainTime.from(match[1]!.padStart(5, "0")).toString({
        smallestUnit: "minute",
      });

      const end = Temporal.PlainTime.from(match[2]!.padStart(5, "0")).toString({
        smallestUnit: "minute",
      });

      if (end <= start) throw new Error("Unexpected My DU lesson duration.");

      return {
        id: `mydu-${settings.studyYear}-${settings.term}-${week}-${item.uid}-${item.classTime.id}`,
        start: `${date} ${start}`,
        end: `${date} ${end}`,
        courseName: item.subjectName,
        location: item.online
          ? "Online"
          : [item.classroom, item.building].filter(Boolean).join(" · "),
        isOnline: item.online,
        teacher: item.replacementTeacherName || item.teacherName || "",
        type: /lecture/i.test(item.lessonType)
          ? "lecture"
          : /practic/i.test(item.lessonType)
            ? "practice"
            : null,
        lessonType: item.lessonType,
      };
    });
  });
}
