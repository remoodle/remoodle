import { and, eq } from "drizzle-orm";
import type { DB } from "../index";
import { sentNotifications } from "../schema";

export function createSentNotificationsRepository(db: DB) {
  function listByUserId(userId: number) {
    return db
      .select({ eventId: sentNotifications.eventId, triggeredAt: sentNotifications.triggeredAt })
      .from(sentNotifications)
      .where(eq(sentNotifications.userId, userId));
  }

  async function has(userId: number, eventId: string) {
    const [row] = await db
      .select({ id: sentNotifications.id })
      .from(sentNotifications)
      .where(and(eq(sentNotifications.userId, userId), eq(sentNotifications.eventId, eventId)))
      .limit(1);

    return !!row;
  }

  async function record(userId: number, notifications: { eventId: string; triggeredAt: Date }[]) {
    if (notifications.length === 0) return;
    await db
      .insert(sentNotifications)
      .values(notifications.map((notification) => ({ userId, ...notification })))
      .onConflictDoNothing();
  }

  return { listByUserId, has, record };
}
