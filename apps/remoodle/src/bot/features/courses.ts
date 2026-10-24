import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import * as myDuRepository from "../../db/repositories/my-du";
import * as usersRepository from "../../db/repositories/users";
import { m } from "../../library/i18n/messages.js";
import { bold } from "../../library/telegram-html";
import { settingLabel, shownHidden } from "../keyboards/labels";
import {
  courseScheduleCallback,
  coursesCallback,
  settingsCallback,
  toggleCourseCallback,
  toggleCourseScheduleFilterCallback,
} from "../callback-data";
import {
  DEFAULT_COURSE_SCHEDULE_FILTERS,
  normalizeScheduleFilters,
  type CourseScheduleFilters,
} from "../../library/schedule";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

async function getUserCourses(userId: number): Promise<string[]> {
  const items = await myDuRepository.findSchedule(userId);
  const names = items.map((i) => i.courseName).filter(Boolean);

  return Array.from(new Set(names)).sort();
}

// Course names are long, so each course gets a full-width row that opens its own screen.
function buildCoursesKeyboard(courses: string[], excluded: string[]) {
  const keyboard = new InlineKeyboard();

  courses.forEach((course, i) => {
    keyboard
      .row()
      .text(
        excluded.includes(course) ? m.courses_hidden_item({ course }) : course,
        courseScheduleCallback.pack({ idx: String(i) }),
      );
  });

  keyboard.row().text(m.ui_back(), settingsCallback.pack({}));

  return keyboard;
}

function buildCourseKeyboard(
  index: number,
  shown: boolean,
  filters: CourseScheduleFilters,
): InlineKeyboard {
  const idx = String(index);

  const filterButton = (label: string, key: keyof CourseScheduleFilters) =>
    [
      settingLabel(label, shownHidden(filters[key])),
      toggleCourseScheduleFilterCallback.pack({ idx, key }),
    ] as const;

  return new InlineKeyboard()
    .text(settingLabel(m.course_toggle(), shownHidden(shown)), toggleCourseCallback.pack({ idx }))
    .row()
    .text(...filterButton(m.course_lectures(), "lecture"))
    .text(...filterButton(m.course_practices(), "practice"))
    .row()
    .text(...filterButton(m.course_online(), "online"))
    .text(...filterButton(m.course_in_person(), "offline"))
    .row()
    .text(m.ui_back(), coursesCallback.pack({}));
}

function buildCourseMessage(course: string) {
  return `${bold(course)}\n\n${m.course_body()}`;
}

async function getCourseContext(ctx: Context) {
  if (!ctx.from) return null;
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user?.hasSchedule) return null;
  const courses = await getUserCourses(user.id);

  return { user, courses };
}

function withCoursesHeader(body: string) {
  return `${bold(m.courses_header())}\n\n${body}`;
}

function buildCoursesMessage(courses: string[], excluded: string[]): string {
  if (courses.length === 0) {
    return withCoursesHeader(m.courses_empty());
  }

  const active = courses.length - excluded.filter((e) => courses.includes(e)).length;

  return withCoursesHeader(m.courses_body({ active, total: courses.length }));
}

feature.command("courses", async (ctx) => {
  if (!ctx.from?.id) {
    return;
  }

  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.reply(m.not_registered());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.reply(withCoursesHeader(m.courses_no_group()), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(user.id);
  } catch {
    await ctx.reply(withCoursesHeader(m.courses_fetch_failed()), {
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
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(withCoursesHeader(m.courses_no_group()), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(user.id);
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

  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  if (!user.hasSchedule) {
    await ctx.answerCallbackQuery(m.error_no_group_linked());

    return;
  }

  let courses: string[];

  try {
    courses = await getUserCourses(user.id);
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

  await usersRepository.update(user.id, { excludedCourses: updated });

  const filters = normalizeScheduleFilters(user.scheduleFilters);
  await ctx.editMessageText(buildCourseMessage(course), {
    parse_mode: "HTML",
    reply_markup: buildCourseKeyboard(
      Number(idx),
      !updated.includes(course),
      filters.courses?.[course] ?? DEFAULT_COURSE_SCHEDULE_FILTERS,
    ),
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
  await ctx.editMessageText(buildCourseMessage(course), {
    parse_mode: "HTML",
    reply_markup: buildCourseKeyboard(
      index,
      !context.user.excludedCourses.includes(course),
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
  await usersRepository.update(context.user.id, { scheduleFilters: filters });
  await ctx.editMessageReplyMarkup({
    reply_markup: buildCourseKeyboard(
      index,
      !context.user.excludedCourses.includes(course),
      updated,
    ),
  });
  await ctx.answerCallbackQuery();
});

export { composer as coursesFeature };
