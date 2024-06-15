import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { config } from "../../config";
import type { MessageStream } from "../../database/redis/models/MessageStream";
import { errorHandler } from "./middleware/error";
import router from "./router/routes";

export const createApi = (messageStream: MessageStream) => {
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

  return api;
};

export const startApi = async (messageStream: MessageStream) => {
  const api = createApi(messageStream);

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
