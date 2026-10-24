import { honoLogLayer } from "@loglayer/hono";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { UserFacingError } from "../library/errors";
import { logger } from "../library/logger";
import type { AppEnv } from "./context";
import { auth } from "./routes/auth";
import { icalFeed, icalToken } from "./routes/ical";
import { moodle } from "./routes/moodle";
import { myDu } from "./routes/my-du";

// The web calendar's server is the only client and calls this API server-to-server with a bearer
// token. The bot and worker use the same services directly instead of calling it over HTTP.
const app = new Hono<AppEnv>()
  .use(honoLogLayer({ instance: logger.child().withContext({ module: "api" }) }))
  .get("/health", (c) => c.json({ ok: true }, 200));

const routes = app
  .route("/api/auth", auth)
  .route("/api/my-du", myDu)
  .route("/api/moodle", moodle)
  .route("/api/ical-token", icalToken)
  .route("/api/ical", icalFeed);

app.onError((error, c) => {
  const status =
    error instanceof HTTPException ? error.status : error instanceof UserFacingError ? 400 : 500;

  if (status >= 500) {
    c.var.logger.withError(error).withMetadata({ status }).error("request failed");
  } else {
    c.var.logger.withMetadata({ status, message: error.message }).warn("request rejected");
  }

  return c.json(
    { message: status >= 500 ? "Something went wrong. Please try again." : error.message },
    status,
  );
});

export type AppType = typeof routes;

export default app;
