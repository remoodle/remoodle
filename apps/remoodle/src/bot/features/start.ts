import { toWeeklySchedule } from "../../library/calendar-api";
import { all } from "better-all";
import { eq } from "drizzle-orm";
import { Composer, InlineKeyboard } from "grammy";
import type { Context } from "../context";
import { config } from "../../config";
import { db } from "../../db";
import { users } from "../../db/schema";
import { fetchUserMoodleEvents } from "../../library/calendar-api";
import { validateRemoodleConnectToken } from "../../library/calendar-api";
import { bold, link } from "../../library/telegram-html";
import {
  applyScheduleFilters,
  buildClassBreakdown,
  getDayName,
  getScheduleForDay,
  mergeAdjacentScheduleItems,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
} from "../../library/schedule";
import { m } from "../../library/i18n/messages.js";
import {
  aboutCallback,
  menuCallback,
  updateCalendarCallback,
  connectCalendarCallback,
  setupCallback,
  scheduleSettingsCallback,
  deadlinesSettingsCallback,
  digestSettingsCallback,
} from "../callback-data";
import { buildMenuKeyboard } from "../keyboards/menu";
import { fetchCachedUserSchedule } from "../schedule-cache";

type MenuUser = {
  calendarUserId: string | null;
  calendarAccountLinked: boolean;
  excludedCourses: string[];
  scheduleFilters?: {
    eventTypes: { lecture: boolean; practice: boolean; learn: boolean };
    eventFormats: { online: boolean; offline: boolean };
    combineAdjacentPairs?: boolean;
  } | null;
  digestEnabled: boolean;
  digestWeekdays: number[];
};

async function buildMenuMessage(ctx: Context, user: MenuUser): Promise<string> {
  const parts: string[] = [m.menu_ready()];

  const summary = await buildMenuSummary(ctx, user);
  if (summary) {
    parts.push(summary);
  } else if (user.calendarAccountLinked && !user.calendarUserId) {
    parts.push(m.warn_no_group_in_calendar());
  } else if (!user.calendarUserId) {
    parts.push(m.warn_add_calendar_url());
  }

  if (user.calendarUserId) {
    const digestWeekdays = normalizeDigestWeekdays(user.digestWeekdays);
    if (!user.digestEnabled) {
      parts.push(m.warn_digest_disabled());
    } else if (digestWeekdays.length === 0) {
      parts.push(m.warn_digest_no_days());
    }
  }

  return parts.join("\n\n");
}

async function buildMenuSummary(ctx: Context, user: MenuUser): Promise<string | null> {
  const { deadlinesCount, todayClasses } = await all({
    async deadlinesCount() {
      return getTodayDeadlinesCount(user);
    },
    async todayClasses() {
      return getTodayClasses(ctx, user);
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

async function getTodayDeadlinesCount(user: Pick<MenuUser, "calendarUserId" | "excludedCourses">) {
  if (!user.calendarUserId) {
    return null;
  }

  try {
    const todayKey = getAlmatyDateKey(Date.now());
    const events = await fetchUserMoodleEvents(user.calendarUserId);
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

async function getTodayClasses(
  ctx: Context,
  user: Pick<MenuUser, "calendarUserId" | "excludedCourses" | "scheduleFilters">,
) {
  if (!user.calendarUserId) {
    return null;
  }

  try {
    const items = toWeeklySchedule(
      await fetchCachedUserSchedule(ctx, user.calendarUserId),
      new Date(),
    );
    const filters = normalizeScheduleFilters(user.scheduleFilters);
    const filtered = applyScheduleFilters(items, filters, user.excludedCourses);
    const merged = filters.combineAdjacentPairs ? mergeAdjacentScheduleItems(filtered) : filtered;
    return getScheduleForDay(merged, getDayName(new Date()));
  } catch {
    return null;
  }
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
    .text(
      m.setup_button_connect_calendar_account(),
      connectCalendarCallback.pack({ from: "setup" }),
    );
}

function buildUpdateCalendarKeyboard(from: "setup" | "deadlines_settings") {
  return new InlineKeyboard().text(
    m.ui_back(),
    from === "deadlines_settings" ? deadlinesSettingsCallback.pack({}) : setupCallback.pack({}),
  );
}

function buildConnectCalendarKeyboard(from: "setup" | "schedule_settings" | "digest_settings") {
  return new InlineKeyboard().text(
    m.ui_back(),
    from === "schedule_settings"
      ? scheduleSettingsCallback.pack({})
      : from === "digest_settings"
        ? digestSettingsCallback.pack({})
        : setupCallback.pack({}),
  );
}

export const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", async (ctx) => {
  const telegramId = ctx.from.id;

  const existing = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);

  if (existing.length > 0) {
    const user = existing[0]!;
    await ctx.reply(await buildMenuMessage(ctx, user), {
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
  await ctx.reply(
    m.calendar_url_prompt({
      guideUrl: link(config.calendar.accountUrl, "Calendar settings"),
    }),
    {
      parse_mode: "HTML",
    },
  );
});

feature.callbackQuery(menuCallback.filter(), async (ctx) => {
  ctx.session.awaitingRemoodleToken = false;
  const telegramId = ctx.from.id;
  const rows = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);

  if (rows.length === 0) {
    await ctx.answerCallbackQuery(m.not_registered_short());
    return;
  }

  const user = rows[0]!;
  await ctx.editMessageText(await buildMenuMessage(ctx, user), {
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
  ctx.session.awaitingRemoodleToken = false;
  await ctx.editMessageText(m.setup_welcome(), {
    parse_mode: "HTML",
    reply_markup: buildSetupKeyboard(),
  });
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(updateCalendarCallback.filter(), async (ctx) => {
  const { from } = updateCalendarCallback.unpack(ctx.callbackQuery.data) as {
    from: "setup" | "deadlines_settings";
  };
  ctx.session.awaitingRemoodleToken = false;
  const keyboard = buildUpdateCalendarKeyboard(from);
  const prompt = m.calendar_url_prompt({
    guideUrl: link(config.calendar.accountUrl, "Calendar settings"),
  });
  try {
    await ctx.editMessageText(prompt, { parse_mode: "HTML", reply_markup: keyboard });
  } catch {
    await ctx.reply(prompt, { parse_mode: "HTML", reply_markup: keyboard });
  }
  await ctx.answerCallbackQuery();
});

feature.callbackQuery(connectCalendarCallback.filter(), async (ctx) => {
  const { from } = connectCalendarCallback.unpack(ctx.callbackQuery.data) as {
    from: "setup" | "schedule_settings" | "digest_settings";
  };
  ctx.session.awaitingRemoodleToken = true;
  const steps = m.connect_calendar_steps({
    accountUrl: link(config.calendar.accountUrl, `${config.calendar.host}/account`),
  });
  try {
    await ctx.editMessageText(steps, {
      parse_mode: "HTML",
      reply_markup: buildConnectCalendarKeyboard(from),
    });
  } catch {
    await ctx.reply(steps, {
      parse_mode: "HTML",
      reply_markup: buildConnectCalendarKeyboard(from),
    });
  }
  await ctx.answerCallbackQuery();
});

feature.on("message:text", async (ctx, next) => {
  const rawText = ctx.message.text.trim();
  const isRemoodleCode = /^RE_[A-Z0-9]{6}$/i.test(rawText);

  if (ctx.session.awaitingRemoodleToken || isRemoodleCode) {
    const code = rawText.toUpperCase();
    const telegramId = ctx.from.id;

    if (!config.calendarApi.url) {
      await ctx.reply(m.calendar_not_configured());
      ctx.session.awaitingRemoodleToken = false;
      return;
    }

    let connectResult: { userId: string; email: string };
    try {
      connectResult = await validateRemoodleConnectToken(code);
    } catch (err) {
      const msg = err instanceof Error ? err.message : m.unknown_error();
      await ctx.reply(m.calendar_connect_error({ error: msg }));
      return;
    }

    await db
      .insert(users)
      .values({
        telegramId,
        calendarUserId: connectResult.userId,
        calendarAccountLinked: true,
        thresholds: config.reminders.defaultThresholds,
      })
      .onConflictDoUpdate({
        target: users.telegramId,
        set: {
          calendarUserId: connectResult.userId,
          calendarAccountLinked: true,
        },
      });

    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);

    ctx.session.awaitingRemoodleToken = false;

    await ctx.reply(`${m.calendar_connected()}\n\n${await buildMenuMessage(ctx, user!)}`, {
      parse_mode: "HTML",
      reply_markup: buildMenuKeyboard(),
    });
    return;
  }

  return next();
});

export { composer as startFeature };
