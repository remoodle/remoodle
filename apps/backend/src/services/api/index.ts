import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { csrf } from "hono/csrf";
import { prettyJSON } from "hono/pretty-json";
import { pinoLogger } from "hono-pino-logger";
import { config, env } from "../../config";
import { logger } from "../../library/logger";
import { applyBullBoard } from "../../library/bull-board";
import {
  registerMetrics,
  printMetrics,
  initUserCounter,
} from "./middleware/metrics";
import { versionHandler } from "./middleware/version";
import { v2 } from "./router/v2";

const api = new Hono();

if (env.isProduction) {
  api.use(csrf({ origin: "remoodle.app" }));
}

api.use("*", pinoLogger(logger.api), prettyJSON());
api.use("*", versionHandler);
api.use("*", cors());

api.use("*", registerMetrics);
api.get("/metrics", printMetrics);

applyBullBoard(api);

api.get("/health", async (ctx) => {
  return ctx.json({ status: "ok" });
});

const routes = api.route("/v2", v2);

const run = () => {
  logger.api.info(
    `Starting server on http://${config.http.host}:${config.http.port}`,
  );

  initUserCounter();

  serve({
    hostname: config.http.host,
    port: config.http.port,
    fetch: api.fetch,
  });
};

run();

export type AppType = typeof routes;
