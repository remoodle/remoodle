import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { ZodType } from "zod";

// Invalid bodies go through app.onError so clients get one error shape with a readable message.
export function jsonBody<T extends ZodType>(schema: T, message: string) {
  return zValidator("json", schema, (result) => {
    if (!result.success) throw new HTTPException(400, { message, cause: result.error });
  });
}
