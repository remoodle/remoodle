import { hc } from "hono/client";
import type { ClientResponse } from "hono/client";
import type { StatusCode } from "hono/utils/http-status";
import type { APIErrorResponse, APIError } from "@remoodle/types";
import { Hono } from "hono";

export const createHC = <A extends Hono<any, any, any>>(url: string) => {
  type ClientFn<T, Z extends "json" | "text" = "json"> = (
    rpc: ReturnType<typeof hc<A>>,
  ) => Promise<ClientResponse<T, StatusCode, Z>>;

  const client = hc<A>(url);

  async function request<T, Z extends "json" | "text" = "json">(
    requestRPC: ClientFn<T, Z>,
  ): Promise<[T, null] | [null, APIError]> {
    const response = await requestRPC(client);

    const type = response.headers.get("Content-Type");

    let data: any;
    if (type && type.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const message =
        type && type.includes("application/json")
          ? (data as APIErrorResponse).error.message
          : (data as string);

      const error: APIError = {
        status: response.status,
        message,
      };

      return [null, error];
    }

    return [data as T, null];
  }

  return { request };
};
