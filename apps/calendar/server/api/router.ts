import { Hono } from "hono";
import type { AppEnv } from "../context";
import { moodleController } from "./controllers/moodle";
import { myDuController } from "./controllers/my-du";
import { remoodleController } from "./controllers/remoodle";
import { subscriptionsController } from "./controllers/subscriptions";

export const apiRouter = new Hono<AppEnv>()
  .route("/", moodleController)
  .route("/", myDuController)
  .route("/", subscriptionsController)
  .route("/", remoodleController);
