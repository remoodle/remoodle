import { createMiddleware } from "@tanstack/react-start";
import { remoodleApi } from "./remoodle-api.server";
import { readSessionToken } from "./session.server";

/**
 * The data boundary for every private server function. Route guards only shape navigation;
 * this rejects direct RPC calls without a session before any request reaches the API.
 */
export const sessionMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const token = readSessionToken();

  if (!token) throw new Error("Sign in to continue.");

  return next({ context: { api: remoodleApi(token).api } });
});
