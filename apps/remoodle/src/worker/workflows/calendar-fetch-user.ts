import { and, eq, notInArray, sql } from "drizzle-orm";
import { db } from "../../db";
import { calendarEvents } from "../../db/schema";
import { fetchCalendarEvents } from "../../library/calendar";
import { hatchet } from "../hatchet-client";
import { deadlineCheckUser } from "./deadline-check-user";

type Input = {
  userId: number;
  telegramId: number;
  calendarUrl: string;
  thresholds: string[];
};

export const calendarFetchUser = hatchet.task<Input>({
  name: "calendar-fetch-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    if (!input.calendarUrl) {
      await deadlineCheckUser.runNoWait({
        userId: input.userId,
        telegramId: input.telegramId,
        thresholds: input.thresholds,
      });
      return;
    }

    try {
      const events = await fetchCalendarEvents(input.calendarUrl);

      if (events.length > 0) {
        await db
          .insert(calendarEvents)
          .values(
            events.map((event) => ({
              userId: input.userId,
              eventId: event.uid,
              summary: event.summary,
              timestampMs: event.timestampMs,
              categories: event.courseName,
              description: event.description,
              fetchedAt: new Date(),
            })),
          )
          .onConflictDoUpdate({
            target: [calendarEvents.userId, calendarEvents.eventId],
            set: {
              summary: sql`excluded.summary`,
              timestampMs: sql`excluded.timestamp_ms`,
              categories: sql`excluded.categories`,
              description: sql`excluded.description`,
              fetchedAt: sql`excluded.fetched_at`,
            },
          });
      }

      const currentIds = events.map((e) => e.uid);
      const deleteWhere =
        currentIds.length > 0
          ? and(
              eq(calendarEvents.userId, input.userId),
              notInArray(calendarEvents.eventId, currentIds),
            )
          : eq(calendarEvents.userId, input.userId);

      await db.delete(calendarEvents).where(deleteWhere);

      await ctx.logger.info("fetched and stored calendar events", {
        userId: input.userId,
        eventCount: events.length,
      });
    } catch (err) {
      await ctx.logger.error("failed to fetch calendar, will use cached events", {
        extra: { userId: input.userId },
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }

    await deadlineCheckUser.runNoWait({
      userId: input.userId,
      telegramId: input.telegramId,
      thresholds: input.thresholds,
    });
  },
});
