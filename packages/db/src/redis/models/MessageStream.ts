import type { Redis } from "ioredis";

export class MessageStream {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  static _getStreamKey(streamName: string) {
    return `stream:${streamName}`;
  }

  async add(
    streamName: string,
    msg: string,
    options: { maxlen?: number } = {},
  ) {
    const { maxlen = 0 } = options;

    const streamKey = MessageStream._getStreamKey(streamName);

    const args = ["XADD", streamKey];

    if (maxlen !== 0) {
      args.push("MAXLEN", "~", `${maxlen}`);
    }

    args.push(
      "*",
      "msg",
      msg,
      "meta",
      JSON.stringify({
        pv: 1,
        ts: new Date().toISOString(),
      }),
    );

    // @ts-expect-error yes
    return this.client.call(...args);
  }

  async ack(streamName: string, groupName: string, ...msgIds: string[]) {
    const streamKey = MessageStream._getStreamKey(streamName);

    await this.client.xack(streamKey, groupName, ...msgIds);
  }

  async get(
    streamName: string,
    groupName: string,
    consumerName: string,
    options: {
      limit?: number;
      idleTimeToClaim?: number;
      maxRetries?: number;
      blockTime?: number;
    } = {},
  ) {
    const streamKey = MessageStream._getStreamKey(streamName);

    const {
      limit = 1,
      idleTimeToClaim = 30000,
      maxRetries = 3,
      blockTime = 1000,
    } = options;

    let messages: any[] = [];

    const pendingMessages: any[] = await this.client.xpending(
      streamKey,
      groupName,
      "IDLE",
      idleTimeToClaim,
      "-",
      "+",
      limit * 2,
    );

    const idsToDelete = pendingMessages
      .filter((x) => x[3] >= maxRetries)
      .map((x) => x[0]);

    if (idsToDelete.length !== 0) {
      const errMsg =
        `${idsToDelete.length} messages exceeded retry limit ` +
        `(${maxRetries}) and were abandoned in stream: ${streamKey}, ` +
        `group: ${groupName}`;

      console.error(errMsg);

      await this.client.xack(streamKey, groupName, ...idsToDelete);
    }

    const idsToClaim = pendingMessages
      .filter((x) => x[3] < maxRetries)
      .map((x) => x[0])
      .slice(0, limit);

    if (idsToClaim.length !== 0) {
      const claimedMessages = await this.client.xclaim(
        streamKey,
        groupName,
        consumerName,
        idleTimeToClaim,
        ...idsToClaim,
      );
      messages = messages.concat(claimedMessages);
    }

    if (messages.length < limit) {
      const newMessages = await this.client.xreadgroup(
        "GROUP",
        groupName,
        consumerName,
        "COUNT",
        limit - messages.length,
        "BLOCK",
        blockTime,
        "STREAMS",
        streamKey,
        ">",
      );

      if (newMessages !== null) {
        messages = messages.concat(newMessages);
      }
    }

    return messages.map((x) => ({
      id: x.id,
      msg: x.msg,
      meta: x.meta,
    }));
  }
}

export default MessageStream;
