import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";
import { config } from "./config";
import { connectDB, redisClient, MessageStream } from "./database";
import { errorHandler } from "./middleware/error";
import router from "./router/routes";
import { init } from "./services/notifications/service";

connectDB();

const messageStream = new MessageStream(redisClient);

init(messageStream).catch((err) =>
  console.error("Error running task manager", err)
);

const api = new Hono();

api.use("*", logger(), prettyJSON());

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

api.post("/event", async (c) => {
  await messageStream.add(
    "grade-change",
    JSON.stringify({
      moodleId: 8798,
      payload: {
        course: "Introduction to SRE | Meirmanova Aigul",
        grades: [
          {
            name: "Final exam documentation",
            previous: "-",
            updated: "96.00%",
          },
          {
            name: "Register Final",
            previous: "-",
            updated: "98.00%",
          },
        ],
      },
    }),
    { maxlen: 10000 }
  );

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
  }
);
