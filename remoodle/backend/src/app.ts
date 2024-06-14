import cron from "node-cron";

import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { config } from "./config";
import { MessageStream, connectDB, redisClient } from "./database";
import { errorHandler } from "./middleware/error";
import router from "./router/routes";
import { initEventService } from "./services/notifications/service";
import { fetchCourses } from "./tasks/fetch-courses";

connectDB();

const messageStream = new MessageStream(redisClient);

initEventService(messageStream).catch((err) =>
  console.error("Error running task manager", err),
);

const api = new Hono();

api.use("*", logger(), prettyJSON());

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

api.post("/event", async (c) => {
  const body = await c.req.json();

  await messageStream.add("grade-change", JSON.stringify(body), {
    maxlen: 10000,
  });

  return c.text("OK", 200);
});

api.route("/", router);

api.notFound((c) => {
  throw new HTTPException(404, {
    message: "Not Found",
  });
});

api.onError(errorHandler);

serve(
  {
    hostname: config.http.host,
    port: config.http.port,
    fetch: api.fetch,
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  },
);

const FIVE_MINUTES = "*/5 * * * *";
// const FIVE_SECONDS = "*/5 * * * * *";

cron.schedule(
  FIVE_MINUTES,
  () => {
    fetchCourses(messageStream, api).catch((error) => {
      console.error("Error running script:", error);
    });
  },
  {
    runOnInit: true,
  },
);
