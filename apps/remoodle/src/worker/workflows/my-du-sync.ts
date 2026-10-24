import { database } from "../../db";
import { SYNC_INTERVAL, syncSchedule } from "../../library/my-du/service";
import { hatchet } from "../hatchet-client";

type UserInput = { userId: number };

export const myDuSyncUser = hatchet.task<UserInput>({
  name: "my-du-sync-user",
  // A full term is one My DU request per week; leave room for slow responses.
  executionTimeout: "10m",
  fn: async (input, ctx) => {
    // Failures are stored on the connection and shown in the web calendar.
    await syncSchedule(input.userId);
    await ctx.logger.info("synced my du schedule", { userId: input.userId });
  },
});

export const myDuSync = hatchet.workflow<Record<string, never>>({
  name: "my-du-sync",
  onCrons: ["0 * * * *"],
});

// Runs hourly and only picks connections whose last attempt is older than SYNC_INTERVAL,
// so each connection refreshes about once a day and new connections spread out naturally.
myDuSync.task({
  name: "dispatch-my-du-syncs",
  executionTimeout: "1m",
  fn: async (_, ctx) => {
    const due = await database.myDu.listSyncDue(new Date(Date.now() - SYNC_INTERVAL));

    if (due.length > 0) {
      await ctx.bulkRunNoWaitChildren(
        due.map(({ userId }) => ({
          workflow: myDuSyncUser.name,
          input: { userId },
          options: { key: String(userId) },
        })),
      );
    }

    await ctx.logger.info("dispatched my du syncs", { childCount: due.length });

    return { dispatched: due.length };
  },
});
