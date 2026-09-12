import { eq } from "drizzle-orm";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { db } from "../../db";
import { users } from "../../db/schema";
import { m } from "../../library/i18n/messages.js";
import { bold } from "../../library/telegram-html";
import {
  courseScheduleCallback,
  coursesCallback,
  settingsCallback,
  toggleCourseCallback,
  toggleCourseScheduleFilterCallback,
} from "../callback-data";
import { fetchCachedUserSchedule } from "../schedule-cache";
import {
  DEFAULT_COURSE_SCHEDULE_FILTERS,
  normalizeScheduleFilters,
  type CourseScheduleFilters,
} from "../../library/schedule";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

async function getUserCourses(ctx: Context, userId: string): Promise<string[]> {
  const items = await fetchCachedUserSchedule(ctx, userId);
  const names = items.map((i) => i.courseName).filter(Boolean);

  return Array.from(new Set(names)).sort();
}

function buildCoursesKeyboard(courses: string[], excluded: string[]) {
  const keyboard = new InlineKeyboard();

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i]!;
    const isExcluded = excluded.includes(course);
    keyboard
      .row()
      .text(isExcluded ? "❌" : "✅", toggleCourseCallback.pack({ idx: String(i) }))
      .text(course, courseScheduleCallback.pack({ idx: String(i) }));
  }

  keyboard.row().text(m.ui_back(), settingsCallback.pack({}));

  return keyboard;
}

function buildCourseScheduleKeyboard(
  index: number,
  filters: CourseScheduleFilters,
): InlineKeyboard {
  return new InlineKeyboard()
    .text(
      `${filters.lecture ? "✅" : "☐"} ${m.class_type_lecture()}`,
      toggleCourseScheduleFilterCallback.pack({ idx: String(index), key: "lecture" }),
    )
    .text(
      `${filters.practice ? "✅" : "☐"} ${m.class_type_practice()}`,
      toggleCourseScheduleFilterCallback.pack({ idx: String(index), key: "practice" }),
    )
    .row()
    .text(
      `${filters.online ? "✅" : "☐"} ${m.location_online()}`,
      toggleCourseScheduleFilterCallback.pack({ idx: String(index), key: "online" }),
    )
    .text(
      `${filters.offline ? "✅" : "☐"} ${m.ui_offline()}`,
      toggleCourseScheduleFilterCallback.pack({ idx: String(index), key: "offline" }),
    )
    .row()
    .text(m.ui_back(), coursesCallback.pack({}));
}

async function getCourseContext(ctx: Context) {
  if (!ctx.from) return null;
  const [user] = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);

  if (!user?.calendarUserId) return null;
  const courses = await getUserCourses(ctx, user.calendarUserId);

  return { user, courses };
}

function buildCoursesMessage(courses: string[], excluded: string[]): string {
  if (courses.length === 0) {
    return m.courses_no_courses();
  }

  const active = courses.length - excluded.filter((e) => courses.includes(e)).length;

  return m.courses_header({ active, total: courses.length });
}

feature.command("courses", async (ctx) => {
  if (!ctx.from?.id) {
    return;
  }

  const rows = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);

  if (rows.length === 0) {
    await ctx.reply(m.not_registered());

    return;
  }

  const user = rows[0]!;

  if (!user.calendarUserId) {
    await ctx.reply(m.courses_no_group(), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(ctx, user.calendarUserId);
  } catch {
    await ctx.reply(m.courses_fetch_failed(), {
      parse_mode: "HTML",
    });

    return;
  }

  await ctx.reply(buildCoursesMessage(courses, user.excludedCourses), {
    parse_mode: "HTML",
    reply_markup: buildCoursesKeyboard(courses, user.excludedCourses),
  });
});

feature.callbackQuery(coursesCallback.filter(), async (ctx) => {
  const rows = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);

  if (rows.length === 0) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  const user = rows[0]!;

  if (!user.calendarUserId) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(m.courses_no_group(), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(ctx, user.calendarUserId);
  } catch {
    await ctx.answerCallbackQuery(m.schedule_fetch_failed_short());

    return;
  }

  await ctx.answerCallbackQuery();
  await ctx.editMessageText(buildCoursesMessage(courses, user.excludedCourses), {
    parse_mode: "HTML",
    reply_markup: buildCoursesKeyboard(courses, user.excludedCourses),
  });
});

feature.callbackQuery(toggleCourseCallback.filter(), async (ctx) => {
  const { idx } = toggleCourseCallback.unpack(ctx.callbackQuery.data);

  const rows = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);

  if (rows.length === 0) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  const user = rows[0]!;

  if (!user.calendarUserId) {
    await ctx.answerCallbackQuery(m.error_no_group_linked());

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(ctx, user.calendarUserId);
  } catch {
    await ctx.answerCallbackQuery(m.schedule_fetch_failed_short());

    return;
  }

  const course = courses[Number(idx)];

  if (!course) {
    await ctx.answerCallbackQuery(m.error_course_not_found());

    return;
  }

  const isExcluded = user.excludedCourses.includes(course);

  const updated = isExcluded
    ? user.excludedCourses.filter((c) => c !== course)
    : [...user.excludedCourses, course];

  await db.update(users).set({ excludedCourses: updated }).where(eq(users.telegramId, ctx.from.id));

  await ctx.editMessageText(buildCoursesMessage(courses, updated), {
    parse_mode: "HTML",
    reply_markup: buildCoursesKeyboard(courses, updated),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(courseScheduleCallback.filter(), async (ctx) => {
  const { idx } = courseScheduleCallback.unpack(ctx.callbackQuery.data);
  const context = await getCourseContext(ctx);
  const index = Number(idx);
  const course = context?.courses[index];

  if (!context || !course) {
    await ctx.answerCallbackQuery(m.error_course_not_found());

    return;
  }

  const filters = normalizeScheduleFilters(context.user.scheduleFilters);
  await ctx.editMessageText(`${bold(course)}\n\n${m.courses_filter_hint()}`, {
    parse_mode: "HTML",
    reply_markup: buildCourseScheduleKeyboard(
      index,
      filters.courses?.[course] ?? DEFAULT_COURSE_SCHEDULE_FILTERS,
    ),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(toggleCourseScheduleFilterCallback.filter(), async (ctx) => {
  const { idx, key } = toggleCourseScheduleFilterCallback.unpack(ctx.callbackQuery.data);

  const context = await getCourseContext(ctx);
  const index = Number(idx);
  const course = context?.courses[index];

  if (
    !context ||
    !course ||
    (key !== "lecture" && key !== "practice" && key !== "online" && key !== "offline")
  ) {
    await ctx.answerCallbackQuery(m.error_course_not_found());

    return;
  }

  const filters = normalizeScheduleFilters(context.user.scheduleFilters);
  const courseFilters = filters.courses?.[course] ?? { ...DEFAULT_COURSE_SCHEDULE_FILTERS };
  const updated = { ...courseFilters, [key]: !courseFilters[key] };
  filters.courses = { ...filters.courses, [course]: updated };
  await db.update(users).set({ scheduleFilters: filters }).where(eq(users.telegramId, ctx.from.id));
  await ctx.editMessageReplyMarkup({ reply_markup: buildCourseScheduleKeyboard(index, updated) });
  await ctx.answerCallbackQuery();
});

export { composer as coursesFeature };
