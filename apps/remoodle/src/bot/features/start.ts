import { all } from "better-all";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { config } from "../../config";
import * as myDuRepository from "../../db/repositories/my-du";
import * as usersRepository from "../../db/repositories/users";
import type { User } from "../../db/repositories/users";
import { approveTelegramLogin } from "../../library/auth";
import { UserFacingError } from "../../library/errors";
import { connectMoodle, fetchDeadlineEvents } from "../../library/moodle/service";
import { START_PAYLOADS } from "../../library/telegram";
import { bold, link } from "../../library/telegram-html";
import {
  applyScheduleFilters,
  buildClassBreakdown,
  getDayName,
  getScheduleForDay,
  mergeAdjacentScheduleItems,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
  toWeeklySchedule,
} from "../../library/schedule";
import { m } from "../../library/i18n/messages.js";
import {
  aboutCallback,
  menuCallback,
  updateCalendarCallback,
  setupCallback,
  deadlinesSettingsCallback,
  loginCallback,
  myDuCallback,
} from "../callback-data";
import { buildMenuKeyboard } from "../keyboards/menu";

type MenuUser = User & { hasSchedule: boolean };

async function buildMenuMessage(user: MenuUser): Promise<string> {
  const parts: string[] = [m.menu_ready()];

  const summary = await buildMenuSummary(user);

  if (summary) {
    parts.push(summary);
  } else if (!user.hasSchedule && !user.moodleCalendarUrl) {
    parts.push(m.warn_add_calendar_url());
  }

  if (user.hasSchedule) {
    const digestWeekdays = normalizeDigestWeekdays(user.digestWeekdays);

    if (!user.digestEnabled) {
      parts.push(m.warn_digest_disabled());
    } else if (digestWeekdays.length === 0) {
      parts.push(m.warn_digest_no_days());
    }
  }

  return parts.join("\n\n");
}

async function buildMenuSummary(user: MenuUser): Promise<string | null> {
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

    return m.menu_classes_today({ breakdown: m.deadline_count({ count: deadlinesCount }) });
  }

  if (classesOnly) {
    if (todayClasses.length === 0) {
      return m.menu_no_classes_today();
    }

    return m.menu_classes_today({ breakdown: buildClassBreakdown(todayClasses) });
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

async function getTodayDeadlinesCount(user: MenuUser) {
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

async function getTodayClasses(user: MenuUser) {
  if (!user.hasSchedule) {
    return null;
  }

  const items = toWeeklySchedule(await myDuRepository.findSchedule(user.id), new Date());
  const filters = normalizeScheduleFilters(user.scheduleFilters);
  const filtered = applyScheduleFilters(items, filters, user.excludedCourses);
  const merged = filters.combineAdjacentPairs ? mergeAdjacentScheduleItems(filtered) : filtered;

  return getScheduleForDay(merged, getDayName(new Date()));
}

function buildAboutMessage() {
  return [
    bold(m.about_header()),
    "",
    m.about_description(),
    "",
    m.about_calendar_link({ url: link(`${config.calendar.url}/`, config.calendar.host) }),
    m.about_github_link({
      url: link("https://github.com/remoodle/heresy", "github.com/remoodle/heresy"),
    }),
    m.about_docs_link({ url: link(`${config.docs.url}/`, config.docs.host) }),
  ].join("\n");
}

function buildSetupKeyboard() {
  return new InlineKeyboard()
    .text(m.setup_button_add_calendar_url(), updateCalendarCallback.pack({ from: "setup" }))
    .row()
    .text(m.my_du_button_connect(), myDuCallback.pack({}));
}

function buildUpdateCalendarKeyboard(from: "setup" | "deadlines_settings") {
  return new InlineKeyboard().text(
    m.ui_back(),
    from === "deadlines_settings" ? deadlinesSettingsCallback.pack({}) : setupCallback.pack({}),
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
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (user) {
    await ctx.reply(await buildMenuMessage(user), {
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
  const user = await usersRepository.findByTelegramId(ctx.from.id);

  if (!user) {
    await ctx.answerCallbackQuery(m.not_registered_short());

    return;
  }

  await ctx.editMessageText(await buildMenuMessage(user), {
    reply_markup: buildMenuKeyboard(),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(aboutCallback.filter(), async (ctx) => {
  await ctx.editMessageText(buildAboutMessage(), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(m.ui_back(), menuCallback.pack({})),
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

  if (from !== "setup" && from !== "deadlines_settings") {
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

  const { id: userId } = await usersRepository.upsertByTelegramId(ctx.from.id);

  try {
    await connectMoodle(userId, ctx.message.text.trim());
  } catch (error) {
    if (!(error instanceof UserFacingError)) throw error;
    await ctx.reply(m.calendar_url_invalid());

    return;
  }

  ctx.session.awaitingMoodleCalendarUrl = false;
  const user = await usersRepository.findById(userId);
  await ctx.reply(`${m.calendar_url_saved()}\n\n${await buildMenuMessage(user!)}`, {
    reply_markup: buildMenuKeyboard(),
  });
});

export { composer as startFeature };
