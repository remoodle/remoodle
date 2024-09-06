import { db } from "../../library/db";
import type { MessageStream } from "../../library/db";
import type { GradeChangeEvent } from "./diff-processor/shims";
import { formatCourseDiffs } from "./diff-processor/formatter";
import { sendTelegramMessage } from "./handlers";

export class GradeChangeEventHandler {
  private streamName: string;
  private groupName: string;
  private consumerName: string;
  private messageStream: MessageStream;

  constructor(messageStream: MessageStream) {
    this.messageStream = messageStream;
    this.streamName = "grade-change";
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
      const msg = JSON.parse(item.msg) as GradeChangeEvent;

      const user = await db.user.findOne({ moodleId: msg.moodleId });

      if (user?.telegramId) {
        const text = formatCourseDiffs(msg.payload);

        const response = await sendTelegramMessage(user.telegramId, text);

        if (response.ok) {
          console.log(
            `[${this.streamName}] Sent notification to Telegram ID`,
            user.telegramId,
          );

          await this.messageStream.ack(
            this.streamName,
            this.groupName,
            item.id,
          );
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

export default GradeChangeEventHandler;
