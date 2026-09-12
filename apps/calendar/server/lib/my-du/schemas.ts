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

export const connectMyDuSchema = z
  .object({
    callbackUrl: z.string().trim().min(1).max(20_000),
    studyYear: z.coerce.number().int().min(2020).max(2100),
    term: z.coerce
      .number()
      .pipe(z.union([z.literal(-1), z.literal(1), z.literal(2), z.literal(3)])),
    firstWeekStart: z.string(),
  })
  .superRefine((settings, context) => {
    try {
      const monday = Temporal.PlainDate.from(settings.firstWeekStart);

      if (
        monday.dayOfWeek !== 1 ||
        monday.year < settings.studyYear ||
        monday.year > settings.studyYear + 1 ||
        monday.toString() !== settings.firstWeekStart
      ) {
        context.addIssue({ code: "custom", message: "Invalid teaching week" });
      }
    } catch {
      context.addIssue({ code: "custom", message: "Invalid teaching week" });
    }
  });

export type MyDuSettings = Omit<z.infer<typeof connectMyDuSchema>, "callbackUrl">;

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

export const scheduleWeekSchema = z.object({
  studyYear: z.number().int().safe(),
  term: z.number().int().safe(),
  weekNumber: z.number().int().safe(),
  slots: z.array(
    z.object({
      weekDay: z.object({ id: z.number().int().min(1).max(7) }),
      items: z.array(lessonSchema),
    }),
  ),
});

export const termLengthSchema = z.object({
  value: z.coerce.number().int().min(1).max(30),
});

export function parseMyDuResponse<T>(schema: z.ZodType<T>, value: z.input<typeof schema>): T {
  const result = schema.safeParse(value);

  if (!result.success) throw new Error(responseError);

  return result.data;
}
