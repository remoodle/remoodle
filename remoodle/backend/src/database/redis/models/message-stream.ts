import type { Redis } from "ioredis";

export interface RedisMessage {
  [key: string]: any;
}

export class MessageStream {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get(
    stream: string,
    group: string,
    consumer: string,
    count: number,
    block: number,
  ): Promise<[string, [string, RedisMessage][]]> {
    const messages = await this.client.xreadgroup(
      "GROUP",
      group,
      consumer,
      "COUNT",
      count,
      "BLOCK",
      block,
      "STREAMS",
      stream,
      ">",
    );

    return messages as [string, [string, RedisMessage][]];
  }

  async ack(stream: string, group: string, messageId: string): Promise<void> {
    await this.client.xack(stream, group, messageId);
  }

  async addEvent(stream: string, event: RedisMessage): Promise<string> {
    const messageId = await this.client.xadd(
      stream,
      "*",
      ...Object.entries(event).flat(),
    );
    return messageId;
  }
}

export default MessageStream;
