import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import { config } from "../config";

type APIMethod = ["GET" | "POST" | "PUT" | "DELETE", string];

export const API_METHOD_AUTH_REGISTER: APIMethod = [
  "POST",
  "/v1/auth/register",
];
export const API_METHOD_USER_COURSES_OVERALL: APIMethod = [
  "GET",
  "/v1/user/courses/overall",
];

// TODO: implement missing methods
export const API_METHOD_DELETE_USER: APIMethod = ["DELETE", "/v1/user"];

const prepareURL = (path: string) => {
  return new URL(path, config.core.url);
};

export const requestCore = async <T = any>(
  endpoint: APIMethod | string,
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
  const response = await fetch(
    prepareURL(typeof endpoint === "string" ? endpoint : endpoint[1]),
    {
      ...options,
      ...(typeof endpoint !== "string" && { method: endpoint[0] }),
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    },
  );

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
