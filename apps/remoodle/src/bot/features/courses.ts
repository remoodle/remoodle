import { eq } from "drizzle-orm";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { db } from "../../db";
import { users } from "../../db/schema";
import { m } from "../../library/i18n/messages.js";
import { coursesCallback, toggleCourseCallback, settingsCallback } from "../callback-data";
import { fetchCachedGroupSchedule } from "../schedule-cache";

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

async function getGroupCourses(ctx: Context, group: string): Promise<string[]> {
  const items = await fetchCachedGroupSchedule(ctx, group);
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
      .text(`${isExcluded ? "❌" : "✅"} ${course}`, toggleCourseCallback.pack({ idx: String(i) }));
  }

  keyboard.row().text(m.ui_back(), settingsCallback.pack({}));
  return keyboard;
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

  if (!user.group) {
    await ctx.reply(m.courses_no_group(), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });
    return;
  }

  let courses: string[];
  try {
    courses = await getGroupCourses(ctx, user.group);
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

  if (!user.group) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(m.courses_no_group(), {
      parse_mode: "HTML",
      reply_markup: new InlineKeyboard().text(m.ui_back(), settingsCallback.pack({})),
    });
    return;
  }

  let courses: string[];
  try {
    courses = await getGroupCourses(ctx, user.group);
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
  const { idx } = toggleCourseCallback.unpack(ctx.callbackQuery.data) as { idx: string };

  const rows = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);
  if (rows.length === 0) {
    await ctx.answerCallbackQuery(m.not_registered_short());
    return;
  }

  const user = rows[0]!;

  if (!user.group) {
    await ctx.answerCallbackQuery(m.error_no_group_linked());
    return;
  }

  let courses: string[];
  try {
    courses = await getGroupCourses(ctx, user.group);
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

export { composer as coursesFeature };
