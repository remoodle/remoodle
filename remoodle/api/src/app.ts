import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { HTTPException } from "hono/http-exception";

import { config } from "./config";
import { connectDB } from "./db/mongo/connect";
import { errorHandler } from "./middleware/error";
import api from "./router";

const app = new Hono();

connectDB();

app.use("*", logger(), prettyJSON());

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.route("/", api);

app.notFound((c) => {
  throw new HTTPException(404, {
    message: "Not Found",
  });
});

app.onError(errorHandler);

serve(
  {
    hostname: config.http.host,
    port: config.http.port,
    fetch: app.fetch,
  },
  (info) => {
    console.log(`Server is running on http://${info.address}:${info.port}`);
  },
);
