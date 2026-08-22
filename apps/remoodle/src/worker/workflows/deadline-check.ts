import { db } from "../../db";
import { users } from "../../db/schema";
import { hatchet } from "../hatchet-client";
import { calendarFetchUser } from "./calendar-fetch-user";

type Input = Record<string, never>;

type Output = {
  "check-deadlines": {
    dispatched: number;
  };
};

export const deadlineCheck = hatchet.workflow<Input, Output>({
  name: "deadline-check",
  onCrons: ["*/10 * * * *"],
});

deadlineCheck.task({
  name: "check-deadlines",
  executionTimeout: "1m",
  fn: async (_, ctx) => {
    const allUsers = await db.select().from(users);

    const childTasks = allUsers.map((user) => ({
      workflow: calendarFetchUser.name,
      input: {
        userId: user.id,
        telegramId: user.telegramId,
        calendarUrl: user.calendarUrl,
        thresholds: user.thresholds,
      },
      options: {
        key: String(user.id),
      },
    }));

    if (childTasks.length === 0) {
      await ctx.logger.info("no users found for deadline check");

      return {
        dispatched: 0,
      };
    }

    await ctx.logger.info("dispatching calendar fetches", {
      childWorkflow: calendarFetchUser.name,
      childCount: childTasks.length,
    });

    await ctx.bulkRunNoWaitChildren(childTasks);

    return {
      dispatched: childTasks.length,
    };
  },
});
