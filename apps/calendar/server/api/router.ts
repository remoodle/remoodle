import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import type { AppEnv } from "../context";
import { moodleController } from "./controllers/moodle";
import { myDuController } from "./controllers/my-du";
import { remoodleController } from "./controllers/remoodle";
import { subscriptionsController } from "./controllers/subscriptions";

export const apiRouter = new Hono<AppEnv>()
  .route("/", moodleController)
  .route("/", myDuController)
  .route("/", subscriptionsController)
  .route("/", remoodleController)
  .on(["GET", "POST"], "/api/auth/*", (c) => createAuth(c.env).handler(c.req.raw));
