import { db } from "../../../database";
import type { MessageStream } from "../../../database";
import type { GradeChangeEvent } from "../../../shims";
import { sendTelegramMessage } from "../../../utils/handlers";
import { formatCourseDiffs } from "../../../utils/parser";

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

      console.log("Processing", item.id, "message for", msg.moodleId);

      if (user?.telegramId) {
        const text = formatCourseDiffs(msg.payload);

        const response = await sendTelegramMessage(user.telegramId, text);

        if (response.ok) {
          console.log("Message sent to Telegram", user.telegramId);

          await this.messageStream.ack(
            this.streamName,
            this.groupName,
            item.id,
          );
        } else {
          console.error(
            "Failed to send message to Telegram",
            response.statusText,
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
