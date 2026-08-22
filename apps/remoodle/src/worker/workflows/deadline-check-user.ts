import { eq } from "drizzle-orm";
import { db } from "../../db";
import { calendarEvents, sentNotifications, users } from "../../db/schema";
import { type CalendarEvent } from "../../library/calendar";
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

    // Load user settings for this check
    const [userRow] = await db
      .select({ deadlinesEnabled: users.deadlinesEnabled, excludedCourses: users.excludedCourses })
      .from(users)
      .where(eq(users.id, input.userId))
      .limit(1);

    if (!userRow?.deadlinesEnabled) {
      return;
    }

    const rows = await db
      .select()
      .from(calendarEvents)
      .where(eq(calendarEvents.userId, input.userId));

    let events: CalendarEvent[] = rows.map((row) => ({
      uid: row.eventId,
      summary: row.summary,
      timestampMs: row.timestampMs,
      courseName: row.categories ?? undefined,
    }));

    // Filter out excluded courses
    const excluded = userRow.excludedCourses;
    if (excluded.length > 0) {
      events = events.filter((e) => !excluded.includes(e.courseName ?? ""));
    }

    if (events.length === 0) {
      await ctx.logger.info("no cached calendar events found", { userId: input.userId });
      return;
    }

    const existing = await db
      .select({ eventId: sentNotifications.eventId, triggeredAt: sentNotifications.triggeredAt })
      .from(sentNotifications)
      .where(eq(sentNotifications.userId, input.userId));

    const existingMapped = existing.map((row) => ({
      eventId: row.eventId,
      triggeredAt: new Date(row.triggeredAt),
    }));

    const pending = trackDeadlineReminders(input.thresholds, events, existingMapped);

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
