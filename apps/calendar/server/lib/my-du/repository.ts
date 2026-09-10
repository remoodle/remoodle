import { and, eq, lt } from "drizzle-orm";
import type { ScheduleItem } from "../../../shared/schedule";
import type { DB } from "../../db";
import { myDuConnections, myDuLoginRequests } from "../../db/schema";
import type { MyDuSettings } from "./schemas";

export type MyDuConnection = typeof myDuConnections.$inferSelect;

export function findConnection(db: DB, userId: string) {
  return db.select().from(myDuConnections).where(eq(myDuConnections.userId, userId)).get();
}

export function saveLoginRequest(db: DB, userId: string, state: string, expiresAt: number) {
  return db
    .insert(myDuLoginRequests)
    .values({ userId, state, expiresAt })
    .onConflictDoUpdate({ target: myDuLoginRequests.userId, set: { state, expiresAt } });
}

export function findLoginRequest(db: DB, userId: string) {
  return db.select().from(myDuLoginRequests).where(eq(myDuLoginRequests.userId, userId)).get();
}

export async function consumeLoginRequest(db: DB, userId: string, state: string) {
  const deleted = await db
    .delete(myDuLoginRequests)
    .where(and(eq(myDuLoginRequests.userId, userId), eq(myDuLoginRequests.state, state)))
    .returning({ userId: myDuLoginRequests.userId });
  return deleted.length === 1;
}

export function replaceConnection(
  db: DB,
  userId: string,
  credentials: string,
  settings: MyDuSettings,
) {
  return db
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
        lockUntil: 0,
      },
    });
}

export async function acquireSyncLease(db: DB, userId: string, now: number, leaseUntil: number) {
  const [row] = await db
    .update(myDuConnections)
    .set({ lockUntil: leaseUntil, lastAttemptAt: now })
    .where(and(eq(myDuConnections.userId, userId), lt(myDuConnections.lockUntil, now)))
    .returning();
  return row;
}

function ownedConnection(userId: string, leaseUntil: number) {
  return and(eq(myDuConnections.userId, userId), eq(myDuConnections.lockUntil, leaseUntil));
}

export function updateCredentials(
  db: DB,
  userId: string,
  leaseUntil: number,
  credentials: string | null,
) {
  return db.update(myDuConnections).set({ credentials }).where(ownedConnection(userId, leaseUntil));
}

export function saveSchedule(
  db: DB,
  userId: string,
  leaseUntil: number,
  events: ScheduleItem[],
  syncedAt: number,
) {
  return db
    .update(myDuConnections)
    .set({ events, lastSyncedAt: syncedAt, syncError: null })
    .where(ownedConnection(userId, leaseUntil));
}

export function saveSyncError(db: DB, userId: string, leaseUntil: number, syncError: string) {
  return db.update(myDuConnections).set({ syncError }).where(ownedConnection(userId, leaseUntil));
}

export function releaseSyncLease(db: DB, userId: string, leaseUntil: number) {
  return db
    .update(myDuConnections)
    .set({ lockUntil: 0 })
    .where(ownedConnection(userId, leaseUntil));
}

export function disconnectConnection(db: DB, userId: string) {
  return db.batch([
    db
      .update(myDuConnections)
      .set({ credentials: null, syncError: null, lockUntil: 0 })
      .where(eq(myDuConnections.userId, userId)),
    db.delete(myDuLoginRequests).where(eq(myDuLoginRequests.userId, userId)),
  ]);
}
