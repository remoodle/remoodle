import * as calendarEventsRepository from "../../db/repositories/calendar-events";
import * as sentNotificationsRepository from "../../db/repositories/sent-notifications";
import * as usersRepository from "../../db/repositories/users";
import { buildReminderMessage, trackDeadlineReminders } from "../../library/deadline-reminders";
import { hatchet } from "../hatchet-client";
import { deadlineNotifyUser } from "./deadline-notify-user";

type Input = {
  userId: number;
  telegramId: number;
  thresholds: string[];
};

export const deadlineCheckUser = hatchet.task<Input>({
  name: "deadline-check-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    if (input.thresholds.length === 0) {
      return;
    }

    const userRow = await usersRepository.findById(input.userId);

    if (!userRow?.deadlinesEnabled) {
      return;
    }

    let events = await calendarEventsRepository.listByUserId(input.userId);

    // Filter out excluded courses
    const excluded = userRow.excludedCourses;

    if (excluded.length > 0) {
      events = events.filter((e) => !excluded.includes(e.courseName ?? ""));
    }

    if (events.length === 0) {
      await ctx.logger.info("no cached calendar events found", { userId: input.userId });

      return;
    }

    const existing = await sentNotificationsRepository.listByUserId(input.userId);
    const pending = trackDeadlineReminders(input.thresholds, events, existing);

    if (pending.length === 0) {
      return;
    }

    const message = buildReminderMessage(events, pending);

    await ctx.logger.info("queueing reminder delivery", {
      userId: input.userId,
      telegramId: input.telegramId,
      reminderCount: pending.length,
    });

    await deadlineNotifyUser.runNoWait({
      chatId: input.telegramId,
      userId: input.userId,
      message,
      reminders: pending.map((reminder) => ({
        eventId: reminder.eventId,
        triggeredAt: reminder.triggeredAt.getTime(),
      })),
    });
  },
});
