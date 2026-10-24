import { database } from "../../db";
import { fetchDeadlineEvents } from "../../library/moodle/service";
import { hatchet } from "../hatchet-client";
import { deadlineCheckUser } from "./deadline-check-user";

type Input = {
  userId: number;
  telegramId: number;
  moodleCalendarUrl: string;
  thresholds: string[];
};

export const calendarFetchUser = hatchet.task<Input>({
  name: "calendar-fetch-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    try {
      const events = await fetchDeadlineEvents(input.moodleCalendarUrl);
      await database.calendarEvents.replaceForUser(input.userId, events);

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
