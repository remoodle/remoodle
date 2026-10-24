import { eq } from "drizzle-orm";
import type { ScheduleFilter } from "../../shared/schedule";
import { db } from "../index";
import { icalTokens } from "../schema";

export async function findByUserId(userId: number) {
  const [row] = await db.select().from(icalTokens).where(eq(icalTokens.userId, userId)).limit(1);

  return row;
}

export async function findByToken(token: string) {
  const [row] = await db.select().from(icalTokens).where(eq(icalTokens.token, token)).limit(1);

  return row;
}

export async function upsert(userId: number, token: string, filters: ScheduleFilter) {
  await db
    .insert(icalTokens)
    .values({ userId, token, filters })
    .onConflictDoUpdate({ target: icalTokens.userId, set: { token, filters } });
}

export async function updateFilters(userId: number, filters: ScheduleFilter) {
  const updated = await db
    .update(icalTokens)
    .set({ filters })
    .where(eq(icalTokens.userId, userId))
    .returning({ userId: icalTokens.userId });

  return updated.length === 1;
}
