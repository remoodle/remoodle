import type { MessageStream } from "../../../database/redis/models/MessageStream";
import { db } from "../../../database";
import { sendTelegramMessage } from "../../../utils/handlers";
import type { GradeChangeEvent } from "../../../shims";
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

  async runJob() {
    console.log("Listening to stream:", this.streamName);

    while (true) {
      try {
        const items = await this.messageStream.get(
          this.streamName,
          this.groupName,
          this.consumerName,
        );

        // console.log("Processing", this.streamName, "messages", items);

        for (const item of items) {
          const msg = JSON.parse(item.msg) as GradeChangeEvent;

          const user = await db.user.findOne({ moodleId: msg.moodleId });

          console.log(
            "Processing",
            msg.moodleId,
            "message",
            msg.payload,
            "user",
            user?.name,
          );

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
      } catch (err) {
        console.error("Error processing messages", err);
      }
    }
  }
}

export default GradeChangeEventHandler;
