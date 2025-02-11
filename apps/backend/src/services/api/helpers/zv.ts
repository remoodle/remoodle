import { ZodSchema } from "zod";
import type { ValidationTargets } from "hono";
import { zValidator as zv } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

export const zValidator = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) =>
  zv(target, schema, (result, c) => {
    if (!result.success) {
      throw new HTTPException(400, {
        message: result.error.errors.map((e) => e.message).join(", "),
      });
    }
  });
