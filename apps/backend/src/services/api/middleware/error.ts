import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "../../../config";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          status: err.status,
          message: err.message,
        },
        ...(env.isDevelopment && { stack: err.stack }),
      },
      err.status,
    );
  }

  return c.json("Internal error", 500);
};
