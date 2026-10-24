import { and, eq, getTableColumns, isNotNull, sql } from "drizzle-orm";
import { config } from "../../config";
import { db } from "../index";
import { myDuConnections, users } from "../schema";

export type User = typeof users.$inferSelect;

export type UserPatch = Partial<Omit<typeof users.$inferInsert, "id" | "telegramId" | "createdAt">>;

// `hasSchedule` is true once My DU has been connected, even if updates are paused,
// because saved classes stay usable.
const userWithSchedule = {
  ...getTableColumns(users),
  hasSchedule: sql<boolean>`${myDuConnections.userId} is not null`.mapWith(Boolean),
};

function selectUsers() {
  return db
    .select(userWithSchedule)
    .from(users)
    .leftJoin(myDuConnections, eq(myDuConnections.userId, users.id));
}

export async function findById(id: number) {
  const [user] = await selectUsers().where(eq(users.id, id)).limit(1);

  return user;
}

export async function findByTelegramId(telegramId: number) {
  const [user] = await selectUsers().where(eq(users.telegramId, telegramId)).limit(1);

  return user;
}

export async function upsertByTelegramId(telegramId: number, patch: UserPatch = {}) {
  const [user] = await db
    .insert(users)
    .values({ telegramId, thresholds: config.reminders.defaultThresholds, ...patch })
    .onConflictDoUpdate({
      target: users.telegramId,
      // An empty patch still needs a SET clause for RETURNING to yield the row.
      set: Object.keys(patch).length > 0 ? patch : { telegramId },
    })
    .returning();

  return user!;
}

export async function update(id: number, patch: UserPatch) {
  await db.update(users).set(patch).where(eq(users.id, id));
}

// Sessions, connections, cached events, and reminder history cascade with the user.
export async function remove(id: number) {
  await db.delete(users).where(eq(users.id, id));
}

export function listDeadlineRecipients() {
  return db
    .select()
    .from(users)
    .where(and(eq(users.deadlinesEnabled, true), isNotNull(users.moodleCalendarUrl)));
}

export function listScheduleRecipients() {
  return db
    .select(getTableColumns(users))
    .from(users)
    .innerJoin(myDuConnections, eq(myDuConnections.userId, users.id))
    .where(eq(users.scheduleEnabled, true));
}

export function listDigestRecipients() {
  return db
    .select(getTableColumns(users))
    .from(users)
    .innerJoin(myDuConnections, eq(myDuConnections.userId, users.id))
    .where(eq(users.digestEnabled, true));
}
