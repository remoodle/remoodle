import * as v from "valibot";

const DuTimeSchema = v.object({
  id: v.string(),
  start: v.string(),
  finish: v.string(),
});

const DuDaysSchema = v.object({
  days: v.array(v.string()),
  daysname: v.array(v.string()),
  time: v.array(DuTimeSchema),
});

export const DuLessonSchema = v.object({
  classtime_day: v.string(),
  classtime_time: v.string(),
  days: v.pipe(v.string(), v.parseJson(), DuDaysSchema),
  subject: v.nullable(v.string(), ""),
  room: v.nullable(v.string(), ""),
  tutor: v.nullable(v.string(), ""),
  lesson_type: v.nullable(v.string()),
});

export const DuScheduleResponseSchema = v.object({
  body: v.array(DuLessonSchema),
});

export const GroupsSchema = v.array(v.string());
export const GroupsFileSchema = v.pipe(v.string(), v.parseJson(), GroupsSchema);

export type DuLesson = v.InferOutput<typeof DuLessonSchema>;
