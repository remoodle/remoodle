import { eq } from "drizzle-orm";
import { Composer } from "grammy";
import type { Context } from "../context";
import { db } from "../../db";
import { users } from "../../db/schema";
import { fetchCalendarEvents } from "../../library/calendar";
import { buildDeadlinesMessage } from "../../library/deadline-reminders";
import { m } from "../../library/i18n/messages.js";
import { deadlinesCallback } from "../callback-data";
import { buildBackToMenuKeyboard } from "../keyboards/menu";

export const composer = new Composer<Context>();

const feature = composer.chatType(["private", "group", "supergroup"]);

async function fetchDeadlinesMessage(
  calendarUrl: string,
  excludedCourses: string[],
  daysLimit?: number,
) {
  const events = await fetchCalendarEvents(calendarUrl);
  const filtered =
    excludedCourses.length > 0
      ? events.filter((e) => !excludedCourses.includes(e.courseName ?? ""))
      : events;
  return buildDeadlinesMessage(filtered, daysLimit);
}

feature.command(["deadlines", "d", "ds"], async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    return;
  }

  const rows = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);

  if (rows.length === 0) {
    await ctx.reply(m.not_registered_use_start());
    return;
  }

  const user = rows[0]!;

  if (!user.calendarUrl) {
    await ctx.reply(m.no_calendar_url_set());
    return;
  }

  await ctx.replyWithChatAction("typing");

  const command = ctx.msg?.text.match(/^\/([a-z0-9_]+)/i)?.[1]?.toLowerCase();
  const daysLimit = command === "ds" ? 2 : undefined;

  let message: string;
  try {
    message = await fetchDeadlinesMessage(user.calendarUrl, user.excludedCourses, daysLimit);
  } catch {
    await ctx.reply(m.calendar_fetch_failed());
    return;
  }

  await ctx.reply(message, { parse_mode: "HTML" });
});

feature.chatType("private").callbackQuery(deadlinesCallback.filter(), async (ctx) => {
  const rows = await db.select().from(users).where(eq(users.telegramId, ctx.from.id)).limit(1);

  if (rows.length === 0) {
    await ctx.answerCallbackQuery(m.not_registered_short());
    return;
  }

  const user = rows[0]!;

  if (!user.calendarUrl) {
    await ctx.answerCallbackQuery({
      text: m.no_calendar_url_callback(),
      show_alert: true,
    });
    return;
  }

  await ctx.answerCallbackQuery();

  let message: string;
  try {
    message = await fetchDeadlinesMessage(user.calendarUrl, user.excludedCourses);
  } catch {
    await ctx.editMessageText(m.calendar_fetch_failed_short(), {
      reply_markup: buildBackToMenuKeyboard(),
    });
    return;
  }

  await ctx.editMessageText(message, {
    parse_mode: "HTML",
    reply_markup: buildBackToMenuKeyboard(),
  });
});

export { composer as deadlinesFeature };
