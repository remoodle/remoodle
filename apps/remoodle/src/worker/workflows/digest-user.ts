import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { sentNotifications } from "../../db/schema";
import {
  applyScheduleFilters,
  buildTodayScheduleMessage,
  DEFAULT_SCHEDULE_FILTERS,
  getAlmatyDateParts,
  mergeAdjacentScheduleItems,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
  type ScheduleFilters,
} from "../../library/schedule";
import { fetchGroupSchedule } from "../../library/calendar-api";
import { m } from "../../library/i18n/messages.js";
import { hatchet } from "../hatchet-client";
import { telegramSendMessage } from "./telegram-send-message";

const CRON_WINDOW_MINUTES = 10;

type Input = {
  userId: number;
  telegramId: number;
  group: string;
  excludedCourses: string[];
  scheduleFilters: ScheduleFilters | null;
  digestTime: string;
  digestWeekdays: number[];
};

function timeToMinutes(time: string): number | null {
  const [hoursRaw, minutesRaw] = time.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

function isWithinDigestWindow(currentTime: string, targetTime: string): boolean {
  const current = timeToMinutes(currentTime);
  const target = timeToMinutes(targetTime);
  if (current === null || target === null) {
    return false;
  }
  const diff = current - target;
  return diff >= 0 && diff < CRON_WINDOW_MINUTES;
}

export const digestUser = hatchet.task<Input>({
  name: "digest-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    const now = new Date();
    const dateParts = getAlmatyDateParts(now);
    const weekdays = normalizeDigestWeekdays(input.digestWeekdays);

    if (weekdays.length === 0 || !weekdays.includes(dateParts.weekday)) {
      return;
    }
    if (!isWithinDigestWindow(dateParts.time, input.digestTime)) {
      return;
    }

    const eventId = `digest:${dateParts.dateKey}`;
    const existing = await db
      .select({ eventId: sentNotifications.eventId })
      .from(sentNotifications)
      .where(
        and(eq(sentNotifications.userId, input.userId), eq(sentNotifications.eventId, eventId)),
      )
      .limit(1);

    if (existing.length > 0) {
      return;
    }

    const allItems = await fetchGroupSchedule(input.group);
    const filters = normalizeScheduleFilters(input.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS);
    const filteredItems = applyScheduleFilters(allItems, filters, input.excludedCourses);
    const items = filters.combineAdjacentPairs
      ? mergeAdjacentScheduleItems(filteredItems)
      : filteredItems;

    const message = buildTodayScheduleMessage(items, now, input.group);
    const replyMarkup = {
      inline_keyboard: [[{ text: m.ui_close(), callback_data: "remove_message" }]],
    };

    await telegramSendMessage.run({ chatId: input.telegramId, message, replyMarkup });

    await db
      .insert(sentNotifications)
      .values({
        userId: input.userId,
        eventId,
        triggeredAt: now,
      })
      .onConflictDoNothing();

    await ctx.logger.info("sent digest", {
      telegramId: input.telegramId,
      dateKey: dateParts.dateKey,
    });
  },
});
