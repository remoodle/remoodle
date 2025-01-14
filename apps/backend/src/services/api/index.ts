import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { HTTPException } from "hono/http-exception";
import { prettyJSON } from "hono/pretty-json";
import { pinoLogger } from "hono-pino-logger";
import { config, env } from "../../config";
import { logger } from "../../library/logger";
import {
  registerMetrics,
  printMetrics,
  initUserCounter,
} from "./middleware/metrics";
import { errorHandler } from "./middleware/error";
import { versionHandler } from "./middleware/version";
import { v2 } from "./router/v2";

const api = new Hono();

if (env.isProduction) {
  api.use(csrf({ origin: "remoodle.app" }));
}

api.use("*", pinoLogger(logger.api), prettyJSON());

api.use("*", versionHandler);

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

api.use("*", registerMetrics);
api.get("/metrics", printMetrics);

api.get("/health", async (ctx) => {
  return ctx.json({ status: "ok" });
});

const routes = api.route("/v2", v2);

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

initUserCounter();
startServer();
