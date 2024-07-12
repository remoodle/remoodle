import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import { config } from "../config";

export const prepareCoreEndpoint = (path: string) => {
  return new URL(path, config.core.url);
};

export const V1_AUTH_REGISTER_URL = prepareCoreEndpoint("/v1/auth/register");

export const V1_USER_COURSES_OVERALL_URL = prepareCoreEndpoint(
  "/v1/user/courses/overall",
);

export const getCoreInternalHeaders = (moodleId: string | number) => {
  return {
    "X-Remoodle-Internal-Token": config.core.secret,
    "X-Remoodle-Moodle-Id": `${moodleId}`,
  };
};

export const requestCore = async (
  url: URL,
  options: RequestInit,
): Promise<[any, null] | [null, HTTPException]> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    return [
      null,
      new HTTPException(response.status as StatusCode, {
        message: `[error::core]: ${response.statusText}`,
      }),
    ];
  }

  return [await response.json(), null];
};
