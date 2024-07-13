import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "../../config";
import { errorHandler } from "./middleware/error";
import router from "./router/routes";

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

showRoutes(api, {
  verbose: true,
});

export const startApi = () => {
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
