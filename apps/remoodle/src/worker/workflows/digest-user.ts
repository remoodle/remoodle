import * as myDuRepository from "../../db/repositories/my-du";
import * as sentNotificationsRepository from "../../db/repositories/sent-notifications";
import {
  applyScheduleFilters,
  buildTodayScheduleMessage,
  DEFAULT_SCHEDULE_FILTERS,
  getAlmatyDateParts,
  getDayName,
  getScheduleForDay,
  mergeAdjacentScheduleItems,
  normalizeDigestWeekdays,
  normalizeScheduleFilters,
  toWeeklySchedule,
  type ScheduleFilters,
} from "../../library/schedule";
import { m } from "../../library/i18n/messages.js";
import { hatchet } from "../hatchet-client";
import { telegramSendMessage } from "./telegram-send-message";

const CRON_WINDOW_MINUTES = 10;

type Input = {
  userId: number;
  telegramId: number;
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

    if (await sentNotificationsRepository.has(input.userId, eventId)) {
      return;
    }

    const allItems = await myDuRepository.findSchedule(input.userId);
    const filters = normalizeScheduleFilters(input.scheduleFilters ?? DEFAULT_SCHEDULE_FILTERS);
    const filteredItems = applyScheduleFilters(allItems, filters, input.excludedCourses);

    const items = filters.combineAdjacentPairs
      ? mergeAdjacentScheduleItems(filteredItems)
      : filteredItems;

    const weeklySchedule = toWeeklySchedule(items, now);
    const todaySchedule = getScheduleForDay(weeklySchedule, getDayName(now));

    if (todaySchedule.length === 0) {
      await sentNotificationsRepository.record(input.userId, [{ eventId, triggeredAt: now }]);

      await ctx.logger.info("skipped empty digest", {
        telegramId: input.telegramId,
        dateKey: dateParts.dateKey,
      });

      return;
    }

    const message = buildTodayScheduleMessage(weeklySchedule, now, "My DU");

    const replyMarkup = {
      inline_keyboard: [[{ text: m.ui_close(), callback_data: "remove_message" }]],
    };

    await telegramSendMessage.run({ chatId: input.telegramId, message, replyMarkup });

    await sentNotificationsRepository.record(input.userId, [{ eventId, triggeredAt: now }]);

    await ctx.logger.info("sent digest", {
      telegramId: input.telegramId,
      dateKey: dateParts.dateKey,
    });
  },
});
