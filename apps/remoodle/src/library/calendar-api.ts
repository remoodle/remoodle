import { hc } from "hono/client";
import { DetailedError, parseResponse } from "hono/client";
import type { AppType } from "../../../calendar/server/index";
import { config } from "../config";

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

export async function fetchGroupSchedule(group: string) {
  try {
    return await parseResponse(
      calendarClient.api.internal.schedule[":group"].$get({
        param: { group },
      }),
    );
  } catch (error) {
    if (error instanceof DetailedError && error.statusCode) {
      throw new Error(`Calendar API error: ${error.statusCode}`);
    }
    throw error;
  }
}
