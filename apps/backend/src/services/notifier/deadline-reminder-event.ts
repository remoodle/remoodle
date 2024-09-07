import { db } from "../../library/db";
import type { MessageStream } from "../../library/db";
import type { DeadlineReminderEvent } from "./diff-processor/shims";
import { formatDeadlineReminders } from "./diff-processor/formatter";
import { sendTelegramMessage } from "./handlers";

export class DeadlineReminderEventHandler {
  private streamName: string;
  private groupName: string;
  private consumerName: string;
  private messageStream: MessageStream;

  constructor(messageStream: MessageStream) {
    this.messageStream = messageStream;
    this.streamName = "deadline-reminder";
    this.groupName = "notifier";
    this.consumerName = "worker";
  }

  async processEvents() {
    const items = await this.messageStream.get(
      this.streamName,
      this.groupName,
      this.consumerName,
    );

    for (const item of items) {
      const msg = JSON.parse(item.msg) as DeadlineReminderEvent;

      const user = await db.user.findOne({ moodleId: msg.moodleId });

      if (
        !user?.telegramId ||
        !user.notificationSettings.telegram.deadlineReminders
      ) {
        await this.messageStream.ack(this.streamName, this.groupName, item.id);

        continue;
      }

      const text = formatDeadlineReminders(msg.payload);

      const response = await sendTelegramMessage(user.telegramId, text);

      if (response.ok) {
        console.log(
          `[${this.streamName}] Sent notification to Telegram ID`,
          user.telegramId,
        );

        await this.messageStream.ack(this.streamName, this.groupName, item.id);
      } else {
        console.error(
          `[${this.streamName}] Failed to send notification to Telegram ID`,
          user.telegramId,
          response.statusText,
          response.status,
        );
      }
    }
  }

  async runJob() {
    console.log("[notifier] Listening to stream:", this.streamName);

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this.processEvents();
      } catch (err) {
        console.error("Error processing messages", err);
      }
    }
  }
}

export default DeadlineReminderEventHandler;
