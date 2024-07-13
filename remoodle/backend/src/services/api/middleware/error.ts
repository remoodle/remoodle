import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

const showStackTrace = process.env.NODE_ENV !== "production";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: {
          status: err.status,
          message: err.message,
        },
        ...(showStackTrace && { stack: err.stack }),
      },
      err.status,
    );
  }

  return c.json("Internal error", 500);
};
