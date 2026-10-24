import { all } from "better-all";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { config } from "../../config";
import { database } from "../../db";
import type { UserWithSchedule } from "../../db/repositories/users";
import { approveTelegramLogin } from "../../library/auth";
import { UserFacingError } from "../../library/errors";
import { connectMoodle, fetchDeadlineEvents } from "../../library/moodle/service";
import { START_PAYLOADS } from "../../library/bot-links";
import { bold } from "../../library/telegram-html";
import { applyScheduleFilters, normalizeScheduleFilters } from "../../library/schedule/filters";
import { buildClassBreakdown } from "../../library/schedule/messages";
import {
  getDayName,
  getScheduleForDay,
  mergeAdjacentScheduleItems,
  toWeeklySchedule,
} from "../../library/schedule/week";
import { m } from "../../library/i18n/messages.js";
import {
  aboutCallback,
  menuCallback,
  updateCalendarCallback,
  setupCallback,
  settingsCallback,
  loginCallback,
  myDuCallback,
} from "../callback-data";
import { buildMenuKeyboard } from "../keyboards/menu";

const menuDateFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Almaty",
  weekday: "long",
  day: "numeric",
  month: "long",
});

// The menu opens with today's date and what it holds, so it doubles as a daily glance.
async function buildMenuMessage(user: UserWithSchedule): Promise<string> {
  const header = bold(menuDateFormat.format(new Date()));

  if (!user.hasSchedule && !user.moodleCalendarUrl) {
    return `${header}\n${m.menu_get_started()}`;
  }

  const summary = await buildMenuSummary(user);

  return summary ? `${header}\n${summary}` : header;
}

async function buildMenuSummary(user: UserWithSchedule): Promise<string | null> {
  const { deadlinesCount, todayClasses } = await all({
    async deadlinesCount() {
      return getTodayDeadlinesCount(user);
    },
    async todayClasses() {
      return getTodayClasses(user);
    },
  });

  const hasBoth = deadlinesCount !== null && todayClasses !== null;
  const deadlineOnly = deadlinesCount !== null && todayClasses === null;
  const classesOnly = todayClasses !== null && deadlinesCount === null;

  if (hasBoth) {
    const freeDay = deadlinesCount === 0 && todayClasses.length === 0;

    if (freeDay) {
      return m.menu_free_day();
    }

    const deadlinePart =
      deadlinesCount === 0 ? m.no_deadlines_count() : m.deadline_count({ count: deadlinesCount });

    const classPart =
      todayClasses.length === 0 ? m.no_classes_count() : buildClassBreakdown(todayClasses);

    return m.menu_today_summary({ deadlines: deadlinePart, classes: classPart });
  }

  if (deadlineOnly) {
    if (deadlinesCount === 0) {
      return m.menu_no_deadlines_today();
    }

    return m.menu_today_breakdown({ breakdown: m.deadline_count({ count: deadlinesCount }) });
  }

  if (classesOnly) {
    if (todayClasses.length === 0) {
      return m.menu_no_classes_today();
    }

    return m.menu_today_breakdown({ breakdown: buildClassBreakdown(todayClasses) });
  }

  return null;
}

function getAlmatyDateKey(value: number | Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Almaty",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

async function getTodayDeadlinesCount(user: UserWithSchedule) {
  if (!user.moodleCalendarUrl) {
    return null;
  }

  try {
    const todayKey = getAlmatyDateKey(Date.now());
    const events = await fetchDeadlineEvents(user.moodleCalendarUrl);

    return events.filter(
      (event) =>
        event.timestampMs > Date.now() &&
        getAlmatyDateKey(event.timestampMs) === todayKey &&
        !user.excludedCourses.includes(event.courseName ?? ""),
    ).length;
  } catch {
    return null;
  }
}

async function getTodayClasses(user: UserWithSchedule) {
  if (!user.hasSchedule) {
    return null;
  }

  const items = toWeeklySchedule(await database.myDu.findSchedule(user.id), new Date());
  const filters = normalizeScheduleFilters(user.scheduleFilters);
  const filtered = applyScheduleFilters(items, filters, user.excludedCourses);
  const merged = filters.combineAdjacentPairs ? mergeAdjacentScheduleItems(filtered) : filtered;

  return getScheduleForDay(merged, getDayName(new Date()));
}

const GITHUB_URL = "https://github.com/remoodle/heresy";

function buildAboutKeyboard() {
  return new InlineKeyboard()
    .url(m.about_button_docs(), `${config.docs.url}/`)
    .url(m.about_button_github(), GITHUB_URL)
    .row()
    .text(m.ui_back(), menuCallback.pack({}));
}

function buildSetupKeyboard() {
  return new InlineKeyboard()
    .text(m.setup_button_connect_moodle(), updateCalendarCallback.pack({ from: "setup" }))
    .row()
    .text(m.my_du_button_connect(), myDuCallback.pack({}));
}

function buildUpdateCalendarKeyboard(from: "setup" | "settings") {
  return new InlineKeyboard().text(
    m.ui_back(),
    from === "settings" ? settingsCallback.pack({}) : setupCallback.pack({}),
  );
}

function resetPrompts(ctx: Context) {
  ctx.session.awaitingMoodleCalendarUrl = false;
  ctx.session.myDuSetup = undefined;
}

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

// Web calendar sign-in: the site sends the user here with `/start login_<code>`.
feature.command("start", async (ctx, next) => {
  if (!ctx.match.startsWith(START_PAYLOADS.loginPrefix)) return next();
  const code = ctx.match.slice(START_PAYLOADS.loginPrefix.length);

  await ctx.reply(m.login_confirm_prompt({ host: config.calendar.host }), {
    reply_markup: new InlineKeyboard()
      .text(m.login_button_confirm(), loginCallback.pack({ code, confirmed: "yes" }))
      .text(m.ui_cancel(), loginCallback.pack({ code, confirmed: "no" })),
  });
});

feature.callbackQuery(loginCallback.filter(), async (ctx) => {
  const { code, confirmed } = loginCallback.unpack(ctx.callbackQuery.data);

  if (confirmed !== "yes") {
    await ctx.editMessageText(m.login_cancelled());
    await ctx.answerCallbackQuery();

    return;
  }

  const approved = await approveTelegramLogin(code, ctx.from);
  await ctx.editMessageText(approved ? m.login_confirmed() : m.login_expired());
  await ctx.answerCallbackQuery();
});

feature.command("start", async (ctx, next) => {
  if (ctx.match !== START_PAYLOADS.moodle) return next();
  resetPrompts(ctx);
  ctx.session.awaitingMoodleCalendarUrl = true;
  await ctx.reply(m.calendar_url_prompt());
});

feature.command("start", async (ctx) => {
  resetPrompts(ctx);
  const user = await database.users.findByTelegramId(ctx.from.id);

  if (user) {
    await ctx.reply(await buildMenuMessage(user), {
      parse_mode: "HTML",
      reply_markup: buildMenuKeyboard(),
    });

    return;
  }

  await ctx.reply(m.setup_welcome(), {
    parse_mode: "HTML",
    reply_markup: buildSetupKeyboard(),
  });
});

feature.command("update", async (ctx) => {
  resetPrompts(ctx);
  ctx.session.awaitingMoodleCalendarUrl = true;
  await ctx.reply(m.calendar_url_prompt());
});

feature.callbackQuery(menuCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  const user = await database.users.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  await ctx.editMessageText(await buildMenuMessage(user), {
    parse_mode: "HTML",
    reply_markup: buildMenuKeyboard(),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(aboutCallback.filter(), async (ctx) => {
  await ctx.editMessageText(`${bold(m.about_header())}\n\n${m.about_body()}`, {
    parse_mode: "HTML",
    reply_markup: buildAboutKeyboard(),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(setupCallback.filter(), async (ctx) => {
  resetPrompts(ctx);
  await ctx.editMessageText(m.setup_welcome(), {
    parse_mode: "HTML",
    reply_markup: buildSetupKeyboard(),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(updateCalendarCallback.filter(), async (ctx) => {
  const { from } = updateCalendarCallback.unpack(ctx.callbackQuery.data);

  if (from !== "setup" && from !== "settings") {
    await ctx.answerCallbackQuery();

    return;
  }

  resetPrompts(ctx);
  ctx.session.awaitingMoodleCalendarUrl = true;
  const keyboard = buildUpdateCalendarKeyboard(from);

  try {
    await ctx.editMessageText(m.calendar_url_prompt(), { reply_markup: keyboard });
  } catch {
    await ctx.reply(m.calendar_url_prompt(), { reply_markup: keyboard });
  }

  await ctx.answerCallbackQuery();
});

feature.on("message:text", async (ctx, next) => {
  if (!ctx.session.awaitingMoodleCalendarUrl) return next();

  const { id: userId } = await database.users.upsertByTelegramId(ctx.from.id);

  try {
    await connectMoodle(userId, ctx.message.text.trim());
  } catch (error) {
    if (!(error instanceof UserFacingError)) throw error;
    await ctx.reply(m.calendar_url_invalid());

    return;
  }

  ctx.session.awaitingMoodleCalendarUrl = false;
  const user = await database.users.findById(userId);
  await ctx.reply(`${m.calendar_url_saved()}\n\n${await buildMenuMessage(user!)}`, {
    parse_mode: "HTML",
    reply_markup: buildMenuKeyboard(),
  });
});

export { composer as startFeature };
