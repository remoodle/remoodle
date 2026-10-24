import { and, eq, isNotNull, isNull, lt, or } from "drizzle-orm";
import type { ScheduleItem } from "../../shared/schedule";
import { db } from "../index";
import { myDuConnections, myDuLoginRequests } from "../schema";

export type MyDuConnection = typeof myDuConnections.$inferSelect;

export type MyDuSettings = Pick<MyDuConnection, "studyYear" | "term" | "firstWeekStart">;

export async function findConnection(userId: number) {
  const [row] = await db
    .select()
    .from(myDuConnections)
    .where(eq(myDuConnections.userId, userId))
    .limit(1);

  return row;
}

export async function findSchedule(userId: number): Promise<ScheduleItem[]> {
  const [row] = await db
    .select({ events: myDuConnections.events })
    .from(myDuConnections)
    .where(eq(myDuConnections.userId, userId))
    .limit(1);

  return row?.events ?? [];
}

export function listSyncDue(attemptedBefore: Date) {
  return db
    .select({ userId: myDuConnections.userId })
    .from(myDuConnections)
    .where(
      and(
        isNotNull(myDuConnections.credentials),
        or(
          isNull(myDuConnections.lastAttemptAt),
          lt(myDuConnections.lastAttemptAt, attemptedBefore),
        ),
      ),
    );
}

export async function saveLoginRequest(userId: number, state: string, expiresAt: Date) {
  await db
    .insert(myDuLoginRequests)
    .values({ userId, state, expiresAt })
    .onConflictDoUpdate({ target: myDuLoginRequests.userId, set: { state, expiresAt } });
}

export async function findLoginRequest(userId: number) {
  const [row] = await db
    .select()
    .from(myDuLoginRequests)
    .where(eq(myDuLoginRequests.userId, userId))
    .limit(1);

  return row;
}

export async function consumeLoginRequest(userId: number, state: string) {
  const deleted = await db
    .delete(myDuLoginRequests)
    .where(and(eq(myDuLoginRequests.userId, userId), eq(myDuLoginRequests.state, state)))
    .returning({ userId: myDuLoginRequests.userId });

  return deleted.length === 1;
}

export async function replaceConnection(
  userId: number,
  credentials: string,
  settings: MyDuSettings,
) {
  await db
    .insert(myDuConnections)
    .values({ userId, credentials, ...settings })
    .onConflictDoUpdate({
      target: myDuConnections.userId,
      set: {
        credentials,
        ...settings,
        events: [],
        lastSyncedAt: null,
        lastAttemptAt: null,
        syncError: null,
        lockedUntil: 0,
      },
    });
}

// Clearing the lease drops writes from a sync that is still fetching the previous period.
export async function updateSettings(userId: number, settings: MyDuSettings) {
  await db
    .update(myDuConnections)
    .set({ ...settings, events: [], lastSyncedAt: null, syncError: null, lockedUntil: 0 })
    .where(eq(myDuConnections.userId, userId));
}

export async function acquireSyncLease(userId: number, now: number, leaseUntil: number) {
  const [row] = await db
    .update(myDuConnections)
    .set({ lockedUntil: leaseUntil, lastAttemptAt: new Date(now) })
    .where(and(eq(myDuConnections.userId, userId), lt(myDuConnections.lockedUntil, now)))
    .returning();

  return row;
}

// Writes made under a lease only land while that lease is still held.
function leased(userId: number, leaseUntil: number) {
  return and(eq(myDuConnections.userId, userId), eq(myDuConnections.lockedUntil, leaseUntil));
}

export async function updateCredentials(
  userId: number,
  leaseUntil: number,
  credentials: string | null,
) {
  await db.update(myDuConnections).set({ credentials }).where(leased(userId, leaseUntil));
}

export async function saveSchedule(userId: number, leaseUntil: number, events: ScheduleItem[]) {
  await db
    .update(myDuConnections)
    .set({ events, lastSyncedAt: new Date(), syncError: null })
    .where(leased(userId, leaseUntil));
}

export async function saveSyncError(userId: number, leaseUntil: number, syncError: string) {
  await db.update(myDuConnections).set({ syncError }).where(leased(userId, leaseUntil));
}

export async function releaseSyncLease(userId: number, leaseUntil: number) {
  await db.update(myDuConnections).set({ lockedUntil: 0 }).where(leased(userId, leaseUntil));
}

// Saved classes stay; only the ability to refresh them is removed.
export async function disconnect(userId: number) {
  await db.batch([
    db
      .update(myDuConnections)
      .set({ credentials: null, syncError: null, lockedUntil: 0 })
      .where(eq(myDuConnections.userId, userId)),
    db.delete(myDuLoginRequests).where(eq(myDuLoginRequests.userId, userId)),
  ]);
}
