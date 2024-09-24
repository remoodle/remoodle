import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "../../config";
import { errorHandler } from "./middleware/error";
import { versionHandler } from "./middleware/version";
import { v1 } from "./router/v1";

const api = new Hono();

api.use("*", logger(), prettyJSON());

api.use("*", versionHandler);

api.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

api.get("/health", async (ctx) => {
  return ctx.json({ status: "ok" });
});

const routes = api.route("/v1", v1);

export type AppType = typeof routes;

api.notFound(() => {
  throw new HTTPException(404, {
    message: "Route not found!",
  });
});

api.onError(errorHandler);

export const startServer = () => {
  console.log("Starting server...");

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
};
