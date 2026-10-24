import { serve } from "@hono/node-server";
import { config } from "../config";
import { logger } from "../library/logger";
import app from "./app";

const log = logger.child().withContext({ module: "api", operation: "startup" });

serve({ fetch: app.fetch, port: config.api.port }, (info) => {
  log.withMetadata({ port: info.port }).info("api started");
});
