import { serve } from "@hono/node-server";
import { rateLimiter } from "hono-rate-limiter";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { pinoLogger } from "hono-pino-logger";
import { config } from "../../config";
import { db } from "../../library/db";
import { logger } from "../../library/logger";
import { errorHandler } from "./middleware/error";
import { versionHandler } from "./middleware/version";
import { v1 } from "./router/v1";

const api = new Hono();

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-6", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  keyGenerator: (c) => {
    // Check for Telegram bot authorization header
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Telegram ")) {
      // Extract telegramId from the Authorization header
      const [, payload] = authHeader.split(" ");
      const [, telegramId] = payload.split("::");
      return `telegram_bot_${telegramId}`;
    }

    // For web requests, use IP address or a fallback
    const ip =
      c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";

    // You can add additional checks here, e.g., for other trusted sources

    return `web_${ip}`;
  },
});

api.use("*", limiter);

api.use("*", pinoLogger(logger.api), prettyJSON());

api.use("*", versionHandler);

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

api.get("/health", async (ctx) => {
  return ctx.json({ status: "ok" });
});

const routes = api.route("/v1", v1);

export type AppType = typeof routes;

api.notFound(() => {
  throw new HTTPException(404, {
    message: "Route not found!",
  });
});

api.onError(errorHandler);

export const startServer = () => {
  logger.api.info("Starting server...");

  serve(
    {
      hostname: config.http.host,
      port: config.http.port,
      fetch: api.fetch,
    },
    (info) => {
      logger.api.info(
        `Server is running on http://${info.address}:${info.port}`,
      );
    },
  );
};

startServer();
