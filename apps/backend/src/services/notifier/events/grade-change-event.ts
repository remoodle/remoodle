import { db } from "../../../library/db";
import type { MessageStream } from "../../../library/db";
import type { GradeChangeEvent } from "../../../library/diff-processor/types";
import { formatCourseDiffs } from "../../../library/diff-processor/formatter";
import { sendTelegramMessage } from "../handlers";

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

  log(message?: any, ...optionalParams: any[]) {
    console.log(`[${this.streamName}] ${message}`, ...optionalParams);
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
          this.log("Sent notification to Telegram ID", user.telegramId);

          await this.messageStream.ack(
            this.streamName,
            this.groupName,
            item.id,
          );
        } else {
          this.log(
            "Failed to send notification to Telegram ID",
            user.telegramId,
          );
        }
      }
    }
  }

  async runJob() {
    console.log("Listening to stream:", this.streamName);

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
