import type { Redis } from "ioredis";
import { MessageStream } from "../../database";
import { handleGradeChange } from "./events/grade-change-event";
import type { RedisMessage } from "../../types";

type EventHandler = (
  messageData: RedisMessage,
  telegramToken: string,
) => Promise<void>;

export class EventService {
  private messageStream: MessageStream;
  private eventHandlers: Map<string, EventHandler>;

  constructor(redisClient: Redis) {
    this.messageStream = new MessageStream(redisClient);
    this.eventHandlers = new Map();

    // Register event handlers
    this.eventHandlers.set("grade-change", handleGradeChange);
  }

  async handleEvents(stream: string, group: string, consumer: string) {
    while (true) {
      try {
        const messages = await this.messageStream.get(
          stream,
          group,
          consumer,
          10,
          0,
        );

        if (messages.length > 0) {
          for (const [streamName, streamMessages] of messages) {
            for (const [messageId, messageData] of streamMessages) {
              const eventType = streamName.split("::")[1];
              const handler = this.eventHandlers.get(eventType);

              if (handler) {
                await handler(messageData);
              }

              await this.messageStream.ack(stream, group, messageId);
            }
          }
        }
      } catch (err) {
        console.error("Error processing messages", err);
      }
    }
  }

  async addEvent(stream: string, event: RedisMessage): Promise<string> {
    return this.messageStream.addEvent(stream, event);
  }
}
