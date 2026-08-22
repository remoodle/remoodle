import { db } from "../../db";
import { sentNotifications } from "../../db/schema";
import { hatchet } from "../hatchet-client";
import { telegramSendMessage } from "./telegram-send-message";

type Reminder = {
  eventId: string;
  triggeredAt: number;
};

type Input = {
  chatId: number;
  userId: number;
  message: string;
  reminders: Reminder[];
};

export const deadlineNotifyUser = hatchet.task<Input>({
  name: "deadline-notify-user",
  executionTimeout: "2m",
  fn: async (input, ctx) => {
    await telegramSendMessage.run({ chatId: input.chatId, message: input.message });

    await db
      .insert(sentNotifications)
      .values(
        input.reminders.map((reminder) => ({
          userId: input.userId,
          ...reminder,
          triggeredAt: new Date(reminder.triggeredAt),
        })),
      )
      .onConflictDoNothing();

    await ctx.logger.info("notified user of deadlines", {
      chatId: input.chatId,
      reminderCount: input.reminders.length,
    });
  },
});
