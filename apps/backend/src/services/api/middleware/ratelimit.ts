import { rateLimiter } from "hono-rate-limiter";
import { HTTPException } from "hono/http-exception";

type ConfigType = Parameters<typeof rateLimiter>[0];

const defaultRules: ConfigType = {
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-6",
  keyGenerator: (c) => {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Telegram ")) {
      const [, payload] = authHeader.split(" ");
      const [, telegramId] = payload.split("::");
      return `telegram_bot_${telegramId}`;
    }

    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

    return `web_${ip}`;
  },
  handler: () => {
    throw new HTTPException(429, {
      message: "Rate limit reached, please try again later",
    });
  },
};

export { defaultRules, rateLimiter };
