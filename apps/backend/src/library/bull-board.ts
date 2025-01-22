import type { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { HonoAdapter } from "@bull-board/hono";
import { serveStatic } from "@hono/node-server/serve-static";
import { queueValues } from "../core/queues";
import { config } from "../config";

const BASE_PATH = "/admin/queues";

export const applyBullBoard = (app: Hono): void => {
  const serverAdapter = new HonoAdapter(serveStatic);

  createBullBoard({
    queues: queueValues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });

  serverAdapter.setBasePath(BASE_PATH);
  app
    .use(
      BASE_PATH,
      basicAuth({
        username: config.admin.username,
        password: config.admin.password,
      }),
    )
    .route(BASE_PATH, serverAdapter.registerPlugin());
};
