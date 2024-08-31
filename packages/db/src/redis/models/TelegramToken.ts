import type { Redis } from "ioredis";

export class TelegramToken {
  private client: Redis;

  static EXPIRY_TIME = 1000 * 60 * 5; // 5 minutes

  constructor(client: Redis) {
    this.client = client;
  }

  static _getTokenKey(token: string) {
    return `telegram:otp:${token}`;
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async set(telegramId: number) {
    const token = TelegramToken.generateOTP();

    await this.client.set(
      TelegramToken._getTokenKey(token),
      telegramId,
      "EX",
      TelegramToken.EXPIRY_TIME,
    );

    return {
      token,
      expiryDate: new Date(Date.now() + TelegramToken.EXPIRY_TIME),
    };
  }

  async get(token: string) {
    const key = TelegramToken._getTokenKey(token);

    const telegramId = await this.client.get(key);

    if (!telegramId) {
      return null;
    }

    return telegramId;
  }

  async remove(token: string) {
    return this.client.del(TelegramToken._getTokenKey(token));
  }
}

export default TelegramToken;
