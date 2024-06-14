import type { MessageStream } from "../../../database";
import { User } from "../../../database";
import { sendTelegramMessage } from "../handlers";

type GradeChangePayload = {
  course: string;
  grades: {
    name: string;
    previous: string;
    updated: string;
  }[];
};

type GradeChangeEvent = {
  moodleId: number;
  payload: GradeChangePayload;
};

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

  static prepareUpdatedGradesMessage(data: GradeChangePayload) {
    const { course, grades } = data;

    let message = "";
    message += "Updated grades:\n\n";
    message += `  ${course}:\n`;
    for (const grade of grades) {
      message += `      ${grade.name} / ${grade.previous} -> ${grade.updated} %\n`;
    }

    return message;
  }

  async runJob() {
    console.log("Starting job", this.streamName);

    while (true) {
      try {
        const items = await this.messageStream.get(
          this.streamName,
          this.groupName,
          this.consumerName
        );

        console.log("Processing", this.streamName, "messages", items);

        for (const item of items) {
          const msg = JSON.parse(item.msg) as GradeChangeEvent;

          const user = await User.findOne({ moodleId: msg.moodleId });

          if (user?.telegramId) {
            const text = GradeChangeEventHandler.prepareUpdatedGradesMessage(
              msg.payload
            );

            const response = await sendTelegramMessage(user.telegramId, text);

            if (response.ok) {
              console.log("Message sent to Telegram", user._id);

              await this.messageStream.ack(
                this.streamName,
                this.groupName,
                item.id
              );
            } else {
              console.error(
                "Failed to send message to Telegram",
                response.statusText
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
