import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import type { StatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";

import { config } from "./config";
import { connectDB } from "./db/mongo/connect";
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

app.onError((err, c) => {
  c.status((c.res.status || 400) as StatusCode);

  return c.json({
    error: {
      status: c.res.status,
      message: c.error?.message,
      stack: process.env.NODE_ENV === "production" ? null : c.error?.stack,
    },
  });
});

serve({
  port: config.http.port,
  fetch: app.fetch,
});
