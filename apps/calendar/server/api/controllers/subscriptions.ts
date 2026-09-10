import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { filterSchedule } from "../../../shared/schedule";
import { filterMoodle } from "../../../shared/moodle";
import { createDb } from "../../db";
import { icalTokens } from "../../db/schema";
import { generateIcal } from "../../lib/ical";
import { readMoodle } from "../../lib/moodle";
import { readSchedule } from "../../lib/my-du/service";
import type { AppEnv } from "../../context";
import { requireSession } from "../middleware/auth";

const filtersSchema = z.object({
  classes: z.boolean().optional(),
  moodle: z
    .object({ attendance: z.boolean(), assignment: z.boolean(), other: z.boolean() })
    .optional(),
  eventTypes: z.object({ lecture: z.boolean(), practice: z.boolean() }),
  eventFormats: z.object({ online: z.boolean(), offline: z.boolean() }),
  excludedCourses: z.array(z.string()),
  ical: z
    .object({
      combineAdjacentPairs: z.boolean().optional(),
      startDate: z.iso.date().optional(),
      endDate: z.iso.date().optional(),
    })
    .optional(),
});
const bodySchema = z.object({ filters: filtersSchema });

async function parseFilters(c: Parameters<typeof requireSession>[0]) {
  const result = bodySchema.safeParse(await c.req.json());
  if (!result.success) {
    throw new HTTPException(400, {
      message: "Invalid calendar filters",
      cause: result.error,
    });
  }
  return result.data.filters;
}

export const subscriptionsController = new Hono<AppEnv>()
  .get("/api/ical/:token", async (c) => {
    c.get("log").set({ ical: { tokenProvided: true } });
    const db = createDb(c.env.DB);
    const [tokenRow] = await db
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.token, c.req.param("token")))
      .limit(1);
    if (!tokenRow) throw new HTTPException(404, { message: "Token not found" });
    const filters = filtersSchema.parse(tokenRow.filters);
    const schedule = await readSchedule(c.env, tokenRow.userId);
    const moodle = await readMoodle(c.env, tokenRow.userId);
    const ical = generateIcal(filterSchedule(schedule.events, filters), {
      moodleEvents: filterMoodle(moodle.events, filters.moodle),
      combineAdjacentPairs: filters.ical?.combineAdjacentPairs,
      rangeStart: filters.ical?.startDate,
      rangeEnd: filters.ical?.endDate,
    });
    return new Response(ical, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="calendar.ics"',
      },
    });
  })
  .get("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);
    const [row] = await createDb(c.env.DB)
      .select()
      .from(icalTokens)
      .where(eq(icalTokens.userId, session.user.id))
      .limit(1);
    const subscription = row
      ? {
          token: row.token,
          url: `${c.env.BETTER_AUTH_URL}/api/ical/${row.token}`,
          filters: row.filters ?? null,
        }
      : null;
    return c.json(subscription);
  })
  .post("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);
    const filters = await parseFilters(c);
    const token = crypto.randomUUID();
    const db = createDb(c.env.DB);
    await db
      .insert(icalTokens)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        token,
        filters,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: icalTokens.userId,
        set: { token, filters, createdAt: new Date() },
      });
    c.get("log").set({ ical: { hasFilters: true } });
    const subscription = { token, url: `${c.env.BETTER_AUTH_URL}/api/ical/${token}` };
    return c.json(subscription);
  })
  .patch("/api/user/ical-token", async (c) => {
    const session = await requireSession(c);
    const filters = await parseFilters(c);
    const changed = await createDb(c.env.DB)
      .update(icalTokens)
      .set({ filters })
      .where(eq(icalTokens.userId, session.user.id))
      .returning({ id: icalTokens.id });
    if (!changed.length) throw new HTTPException(404, { message: "Token not found" });
    c.get("log").set({ ical: { hasFilters: true } });
    return c.json({ ok: true });
  });
