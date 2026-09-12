import { hc } from "hono/client";
import { DetailedError, parseResponse } from "hono/client";
import type { AppType } from "../../../calendar/server/index";
import { config } from "../config";
import { moodleToDeadlineEvents } from "./calendar";

// Bot messages are a weekly view of dated personal events, not a repeating source timetable.
export function toWeeklySchedule<T extends { start: string; end: string }>(
  items: T[],
  now: Date,
  weekOffset = 0,
): T[] {
  const local = new Date(now.getTime() + 5 * 60 * 60_000);

  const monday = new Date(
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() - ((local.getUTCDay() + 6) % 7) + weekOffset * 7,
    ),
  );

  const end = new Date(monday.getTime() + 7 * 86_400_000).toISOString().slice(0, 10);
  const start = monday.toISOString().slice(0, 10);
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return items.flatMap((item) => {
    if (item.start.slice(0, 10) < start || item.start.slice(0, 10) >= end) {
      return [];
    }

    const day = weekdays[new Date(item.start.slice(0, 10) + "T12:00:00Z").getUTCDay()];

    return [
      {
        ...item,
        start: `${day} ${item.start.slice(11)}`,
        end: `${day} ${item.end.slice(11)}`,
      },
    ];
  });
}

const calendarClient = hc<AppType>(config.calendarApi.url, {
  headers: {
    "Content-Type": "application/json",
    "X-Internal-Token": config.calendarApi.internalToken,
  },
});

export async function validateRemoodleConnectToken(token: string) {
  try {
    return await parseResponse(
      calendarClient.api.internal.remoodle.connect.$post({
        json: { token },
      }),
    );
  } catch (error) {
    if (error instanceof DetailedError && error.statusCode === 404) {
      throw new Error("Invalid or expired code. Please generate a new one.");
    }

    if (error instanceof DetailedError && error.statusCode) {
      throw new Error(`Calendar API error: ${error.statusCode}`);
    }

    throw error;
  }
}

export async function fetchUserSchedule(userId: string) {
  try {
    return await parseResponse(
      calendarClient.api.internal.schedule[":userId"].$get({
        param: { userId },
      }),
    );
  } catch (error) {
    if (error instanceof DetailedError && error.statusCode) {
      throw new Error(`Calendar API error: ${error.statusCode}`);
    }

    throw error;
  }
}

export async function fetchUserMoodleEvents(userId: string) {
  const { events } = await parseResponse(
    calendarClient.api.internal.moodle[":userId"].$get({ param: { userId } }),
  );

  return moodleToDeadlineEvents(events);
}

export async function fetchMoodleUrlEvents(url: string) {
  const { events } = await parseResponse(
    calendarClient.api.internal.moodle.feed.$post({ json: { url } }),
  );

  return moodleToDeadlineEvents(events);
}

export async function connectUserMoodle(userId: string, url: string) {
  return parseResponse(
    calendarClient.api.internal.moodle[":userId"].$post({
      param: { userId },
      json: { url },
    }),
  );
}

export async function fetchUserMoodle(userId: string) {
  return parseResponse(calendarClient.api.internal.moodle[":userId"].$get({ param: { userId } }));
}
