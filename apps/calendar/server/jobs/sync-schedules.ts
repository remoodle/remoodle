import { and, isNotNull, isNull, lt, or } from "drizzle-orm";
import { createDb } from "../db";
import { myDuConnections } from "../db/schema";
import { SYNC_INTERVAL, syncSchedule } from "../lib/my-du/service";

export async function syncDueSchedules(env: Env, context: ExecutionContext) {
  const now = Date.now();

  const rows = await createDb(env.DB)
    .select({ userId: myDuConnections.userId })
    .from(myDuConnections)
    .where(
      and(
        isNotNull(myDuConnections.credentials),
        lt(myDuConnections.lockUntil, now),
        or(
          isNull(myDuConnections.lastAttemptAt),
          lt(myDuConnections.lastAttemptAt, now - SYNC_INTERVAL),
        ),
      ),
    )
    .limit(1);

  for (const row of rows) {
    context.waitUntil(syncSchedule(env, row.userId));
  }
}
