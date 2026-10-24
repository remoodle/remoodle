import { eq } from "drizzle-orm";
import type { ScheduleFilter } from "../../library/schedule/items";
import type { DB } from "../index";
import { icalTokens } from "../schema";

export function createIcalTokensRepository(db: DB) {
  async function findByUserId(userId: number) {
    const [row] = await db.select().from(icalTokens).where(eq(icalTokens.userId, userId)).limit(1);

    return row;
  }

  async function findByToken(token: string) {
    const [row] = await db.select().from(icalTokens).where(eq(icalTokens.token, token)).limit(1);

    return row;
  }

  async function upsert(userId: number, token: string, filters: ScheduleFilter) {
    await db
      .insert(icalTokens)
      .values({ userId, token, filters })
      .onConflictDoUpdate({ target: icalTokens.userId, set: { token, filters } });
  }

  async function updateFilters(userId: number, filters: ScheduleFilter) {
    const updated = await db
      .update(icalTokens)
      .set({ filters })
      .where(eq(icalTokens.userId, userId))
      .returning({ userId: icalTokens.userId });

    return updated.length === 1;
  }

  return { findByUserId, findByToken, upsert, updateFilters };
}
