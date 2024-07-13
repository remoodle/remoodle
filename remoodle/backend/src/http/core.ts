import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import { config } from "../config";

export type APIMethod = ["GET" | "POST" | "PUT" | "DELETE", string];

export const API_METHODS = {
  HEALTH: ["GET", "/health"] as APIMethod,

  V1_AUTH_REGISTER: ["POST", "/v1/auth/register"] as APIMethod,
  V1_DELETE_USER: ["DELETE", "/v1/user"] as APIMethod,

  V1_USER_COURSES_OVERALL: ["GET", "/v1/user/courses/overall"] as APIMethod,
  V1_USER_DEADLINES: ["GET", "/v1/user/deadlines"] as APIMethod,

  V1_COURSE: ["GET", "/v1/course/*"] as APIMethod,
  V1_USER_COURSE: ["GET", "/v1/user/course/*"] as APIMethod,
} as const;

const prepareURL = (path: string) => {
  return new URL(path, config.core.url);
};

export const requestCore = async <T = any>(
  endpoint: APIMethod,
  options: RequestInit,
): Promise<
  | [
      {
        status: StatusCode;
        data: T;
      },
      null,
    ]
  | [null, HTTPException]
> => {
  console.log(prepareURL(endpoint[1]));
  const response = await fetch(prepareURL(endpoint[1]), {
    ...options,
    method: endpoint[0],
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

  return [
    {
      status: response.status as StatusCode,
      data: (await response.json()) as T,
    },
    null,
  ];
};

export const getCoreInternalHeaders = (moodleId: string | number) => {
  return {
    "X-Remoodle-Internal-Token": config.core.secret,
    "X-Remoodle-Moodle-Id": `${moodleId}`,
  };
};
