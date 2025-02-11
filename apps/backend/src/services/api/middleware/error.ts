import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "../../../config";

export const errorHandler: ErrorHandler = (err, c) => {
  const status = err instanceof HTTPException ? err.status : 500;

  return c.json(
    {
      error: {
        status,
        message: err.message,
      },
      ...(env.isDevelopment && { stack: err.stack }),
    },
    status,
  );
};
