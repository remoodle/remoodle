import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import { config } from "./config";
import { connectDB, redisClient } from "./database";
import { errorHandler } from "./middleware/error";
import router from "./router/routes";

connectDB();

import { EventService } from "./services/notifications";

const eventService = new EventService(redisClient);

async function init() {
  eventService
    .handleEvents("stream::grade-change", "tg", "worker")
    .catch((err) => console.error("Handler error", err));

  process.on("SIGINT", async () => {
    console.log("Shutting down server...");
    // server.close();
    // await serverApp.shutdown();
    console.log("Server gracefully shutdown.");
    process.exit(0);
  });
}

init().catch((err) => {
  console.error("Failed to initialize the application", err);
  process.exit(1);
});

const api = new Hono();

api.use("*", logger(), prettyJSON());

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

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
