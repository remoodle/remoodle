import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { cors } from "hono/cors";
import { connectDB } from "./database/mongo/connection";
import { errorHandler, notFound } from "./middlewares/error";
import { config } from "./config";
import api from "./routes/v1";

const app = new Hono();

connectDB();

app.use("*", logger(), prettyJSON());

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.route("/v1", api);

app.onError((err, c) => {
  const error = errorHandler(c);
  return error;
});

app.notFound((c) => {
  const error = notFound(c);
  return error;
});

serve({
  port: config.port,
  fetch: app.fetch,
});
