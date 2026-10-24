import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

// Server functions are same-origin RPC; reject cross-site calls before a session cookie is trusted.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware],
}));
