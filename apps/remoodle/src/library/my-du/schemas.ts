// Browser-safe: the calendar app imports this module through its `@remoodle` alias.
import { Temporal } from "temporal-polyfill";
import { z } from "zod";

const responseError = "Unexpected My DU response.";

export const credentialsSchema = z.object({
  access_token: z
    .string()
    .min(1)
    .regex(/^[^\r\n;]+$/),
  refresh_token: z
    .string()
    .min(1)
    .regex(/^[^\r\n;]+$/),
});

export type MyDuCredentials = z.infer<typeof credentialsSchema>;

export const MY_DU_TERMS = [1, 2, 3, -1] as const;

// -1 is My DU's id for "Additional period 1".
export type MyDuTerm = (typeof MY_DU_TERMS)[number];

export type MyDuPeriod = { term: MyDuTerm; firstWeekStart: string };

// Accepts 2026-09-07 or 07.09.2026. Teaching week 1 always starts on a Monday.
export function parseFirstWeekStart(input: string) {
  const dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(input.trim());

  try {
    const date = dotted
      ? Temporal.PlainDate.from(
          { year: Number(dotted[3]), month: Number(dotted[2]), day: Number(dotted[1]) },
          { overflow: "reject" },
        )
      : Temporal.PlainDate.from(input.trim(), { overflow: "reject" });

    return date.dayOfWeek === 1 ? date.toString() : null;
  } catch {
    return null;
  }
}

// The web API's version of what the bot asks step by step.
export const myDuPeriodSchema = z.object({
  term: z.literal(MY_DU_TERMS),
  firstWeekStart: z.string().transform((value, context) => {
    const monday = parseFirstWeekStart(value);

    if (!monday) {
      context.addIssue({ code: "custom", message: "Teaching week 1 must start on a Monday" });

      return z.NEVER;
    }

    return monday;
  }),
});

export const myDuConnectSchema = myDuPeriodSchema.extend({
  callbackUrl: z.string().trim().min(1).max(20_000),
});

// My DU names academic years after the calendar year they start in. Every period of a
// year starts between late August and the following summer, so August is the boundary.
export function studyYearOf(firstWeekStart: string) {
  const date = Temporal.PlainDate.from(firstWeekStart);

  return date.month >= 8 ? date.year : date.year - 1;
}

const classTimeSchema = z.object({
  id: z.number().int().safe(),
  title: z.string(),
});

const lessonSchema = z.object({
  uid: z.number().int().safe(),
  classTime: classTimeSchema,
  subjectName: z.string(),
  lessonType: z.string(),
  online: z.boolean(),
  classroom: z.string().nullish(),
  building: z.string().nullish(),
  teacherName: z.string().nullish(),
  replacementTeacherName: z.string().nullish(),
});

// My DU fills every free period of the weekly grid with an item whose fields are all null.
const emptySlotSchema = z.object({ uid: z.null() });

export const scheduleWeekSchema = z.object({
  studyYear: z.number().int().safe(),
  term: z.number().int().safe(),
  weekNumber: z.number().int().safe(),
  slots: z.array(
    z.object({
      weekDay: z.object({ id: z.number().int().min(1).max(7) }),
      items: z.array(z.union([lessonSchema, emptySlotSchema])),
    }),
  ),
});

export const termLengthSchema = z.object({
  value: z.coerce.number().int().min(1).max(30),
});

export function parseMyDuResponse<T>(schema: z.ZodType<T>, value: z.input<typeof schema>): T {
  const result = schema.safeParse(value);

  // Keep the Zod issues as the cause so sync logs show which field My DU changed.
  if (!result.success) throw new Error(responseError, { cause: result.error });

  return result.data;
}
