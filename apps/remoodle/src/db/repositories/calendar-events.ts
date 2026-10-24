import { and, eq, notInArray, sql } from "drizzle-orm";
import type { DeadlineEvent } from "../../library/moodle/deadlines";
import { db } from "../index";
import { calendarEvents } from "../schema";

export async function listByUserId(userId: number): Promise<DeadlineEvent[]> {
  const rows = await db.select().from(calendarEvents).where(eq(calendarEvents.userId, userId));

  return rows.map((row) => ({
    uid: row.eventId,
    summary: row.summary,
    timestampMs: row.timestampMs,
    courseName: row.categories ?? undefined,
    description: row.description ?? undefined,
  }));
}

// Mirrors the latest Moodle feed: upserts current events and drops the ones that disappeared.
export async function replaceForUser(userId: number, events: DeadlineEvent[]) {
  await db.transaction(async (tx) => {
    if (events.length > 0) {
      await tx
        .insert(calendarEvents)
        .values(
          events.map((event) => ({
            userId,
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

    await tx.delete(calendarEvents).where(
      events.length > 0
        ? and(
            eq(calendarEvents.userId, userId),
            notInArray(
              calendarEvents.eventId,
              events.map((event) => event.uid),
            ),
          )
        : eq(calendarEvents.userId, userId),
    );
  });
}
