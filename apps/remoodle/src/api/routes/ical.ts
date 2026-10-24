import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { config } from "../../config";
import * as icalTokensRepository from "../../db/repositories/ical-tokens";
import * as myDuRepository from "../../db/repositories/my-du";
import { randomToken } from "../../library/crypto";
import {
  generateCalendarEventsIcal,
  mergeAdjacentCalendarEvents,
  scheduleToCalendarEvents,
} from "../../shared/ical";
import { filterSchedule, scheduleFilterSchema } from "../../shared/schedule";
import type { AppEnv, SessionEnv } from "../context";
import { privateResponse, requireSession } from "../middleware/session";
import { jsonBody } from "../validator";

const filtersBody = jsonBody(
  z.object({ filters: scheduleFilterSchema }),
  "Invalid calendar filters",
);

function subscriptionUrl(token: string) {
  return `${config.api.url}/api/ical/${token}`;
}

// Public feed for calendar apps; the unguessable token is the only credential.
export const icalFeed = new Hono<AppEnv>().get("/:token", async (c) => {
  const row = await icalTokensRepository.findByToken(c.req.param("token"));

  if (!row) throw new HTTPException(404, { message: "Token not found" });

  const { filters } = row;

  const events = scheduleToCalendarEvents(
    filterSchedule(await myDuRepository.findSchedule(row.userId), filters),
  );

  const ical = generateCalendarEventsIcal(
    filters.ical?.combineAdjacentPairs ? mergeAdjacentCalendarEvents(events) : events,
    filters.ical?.startDate,
    filters.ical?.endDate,
  );

  return c.body(ical, 200, {
    "Content-Type": "text/calendar; charset=utf-8",
    "Content-Disposition": 'inline; filename="calendar.ics"',
  });
});

export const icalToken = new Hono<SessionEnv>()
  .use(privateResponse, requireSession)
  .get("/", async (c) => {
    const row = await icalTokensRepository.findByUserId(c.var.user.id);

    return c.json(row ? { url: subscriptionUrl(row.token), filters: row.filters } : null, 200);
  })
  .post("/", filtersBody, async (c) => {
    const { filters } = c.req.valid("json");
    const token = randomToken();
    await icalTokensRepository.upsert(c.var.user.id, token, filters);

    return c.json({ url: subscriptionUrl(token), filters }, 200);
  })
  .patch("/", filtersBody, async (c) => {
    const { filters } = c.req.valid("json");

    if (!(await icalTokensRepository.updateFilters(c.var.user.id, filters))) {
      throw new HTTPException(404, { message: "Generate a subscription link first." });
    }

    return c.json({ ok: true }, 200);
  });
