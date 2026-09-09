import { eq } from "drizzle-orm";
import { db } from "../../db";
import { m } from "../../library/i18n/messages.js";
import { sentNotifications } from "../../db/schema";
import { fetchUserSchedule } from "../../library/calendar-api";
import { durationToMs } from "../../library/dates";
import {
  applyScheduleFilters,
  mergeAdjacentScheduleItems,
  normalizeScheduleFilters,
  DEFAULT_SCHEDULE_FILTERS,
  type ScheduleFilters,
} from "../../library/schedule";
import { extractRoomCode } from "../../library/rooms";
import { bold } from "../../library/telegram-html";
import { hatchet } from "../hatchet-client";
import { telegramSendMessage } from "./telegram-send-message";

type Input = {
  userId: number;
  telegramId: number;
  calendarUserId: string;
  excludedCourses: string[];
  scheduleFilters: ScheduleFilters | null;
  scheduleReminderOffset: string;
};

const ALMATY_OFFSET_MS = 5 * 60 * 60 * 1000;

function scheduleItemStartToMs(start: string): number | null {
  const value = Date.parse(start.replace(" ", "T") + "+05:00");
  return Number.isFinite(value) ? value : null;
}

function almatyDateStr(utcMs: number): string {
  const d = new Date(utcMs + ALMATY_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildClassReminderMessage(
  items: {
    courseName: string;
    start: string;
    end: string;
    isOnline: boolean;
    location: string;
    minsUntil: number;
  }[],
): string {
  const lines = items.map((item) => {
    const startTime = item.start.split(" ")[1] ?? item.start;
    const endTime = item.end.split(" ")[1] ?? item.end;
    const location = item.isOnline ? m.location_online() : item.location;
    return m.class_reminder_item({
      time: bold(`${startTime} – ${endTime}`),
      course: item.courseName,
      location,
    });
  });

  const minsUntil = items[0]!.minsUntil;
  return `${bold(m.class_reminder_header({ minutes: minsUntil }))}\n\n${lines.join("\n\n")}`;
}

export const scheduleReminderCheckUser = hatchet.task<Input>({
  name: "schedule-reminder-check-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    const offsetMs = durationToMs(input.scheduleReminderOffset);
    const now = new Date();
    const nowMs = now.getTime();
    const windowEndMs = nowMs + offsetMs;

    const allItems = await fetchUserSchedule(input.calendarUserId);
    const filters = normalizeScheduleFilters(input.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS);
    const filteredItems = applyScheduleFilters(allItems, filters, input.excludedCourses);
    const items = filters.combineAdjacentPairs
      ? mergeAdjacentScheduleItems(filteredItems)
      : filteredItems;

    // Find classes starting within the offset window
    const upcoming = items.flatMap((item) => {
      const startMs = scheduleItemStartToMs(item.start);
      if (startMs === null) return [];
      if (startMs <= nowMs || startMs > windowEndMs) return [];
      const dateStr = almatyDateStr(startMs);
      const eventId = `sched:${item.id}:${dateStr}`;
      return [{ item, startMs, eventId, minsUntil: Math.round((startMs - nowMs) / 60000) }];
    });

    if (upcoming.length === 0) {
      return;
    }

    // Check which ones we already sent
    const existingIds = new Set(
      (
        await db
          .select({ eventId: sentNotifications.eventId })
          .from(sentNotifications)
          .where(eq(sentNotifications.userId, input.userId))
      )
        .filter((r) => r.eventId.startsWith("sched:"))
        .map((r) => r.eventId),
    );

    const toSend = upcoming.filter((u) => !existingIds.has(u.eventId));

    if (toSend.length === 0) {
      return;
    }

    const message = buildClassReminderMessage(
      toSend.map((u) => ({
        courseName: u.item.courseName,
        start: u.item.start,
        end: u.item.end,
        isOnline: u.item.isOnline,
        location: u.item.location,
        minsUntil: u.minsUntil,
      })),
    );

    // Build keyboard: room photo buttons for each unique offline room, then close
    const seenRooms = new Set<string>();
    for (const { item } of toSend) {
      if (!item.isOnline) {
        const code = extractRoomCode(item.location);
        if (code) seenRooms.add(code);
      }
    }

    const roomRows: { text: string; callback_data: string }[][] = [];
    const roomEntries = Array.from(seenRooms);
    for (let i = 0; i < roomEntries.length; i += 3) {
      roomRows.push(
        roomEntries.slice(i, i + 3).map((code) => ({
          text: `📍 ${code}`,
          callback_data: `room_photo:${code}`,
        })),
      );
    }

    const replyMarkup = {
      inline_keyboard: [...roomRows, [{ text: m.ui_close(), callback_data: "remove_message" }]],
    };

    await telegramSendMessage.run({ chatId: input.telegramId, message, replyMarkup });

    await db
      .insert(sentNotifications)
      .values(
        toSend.map((u) => ({
          userId: input.userId,
          eventId: u.eventId,
          triggeredAt: new Date(),
        })),
      )
      .onConflictDoNothing();

    await ctx.logger.info("sent schedule reminders", {
      telegramId: input.telegramId,
      count: toSend.length,
    });
  },
});
