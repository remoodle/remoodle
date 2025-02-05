import { hc } from "hono/client";
import type { ClientResponse, ClientRequestOptions } from "hono/client";
import type { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import type { APIErrorResponse, APIError } from "@remoodle/types";
import { HTTPException } from "hono/http-exception";

export const createHC = <A extends Hono<any, any, any>>(
  url: string,
  options?: ClientRequestOptions,
) => {
  type ClientFn<T, Z extends "json" | "text" = "json"> = (
    rpc: ReturnType<typeof hc<A>>,
  ) => Promise<ClientResponse<T, StatusCode, Z>>;

  const client = hc<A>(url, options);

  async function request<T, Z extends "json" | "text" = "json">(
    requestRPC: ClientFn<T, Z>,
  ): Promise<[T, null] | [null, APIError]> {
    try {
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
    } catch (err: any) {
      const error: APIError = {
        status: 500,
        message: err.message || "Something went wrong",
      };
      return [null, error];
    }
  }

  async function requestUnwrap<T, Z extends "json" | "text" = "json">(
    requestRPC: ClientFn<T, Z>,
  ): Promise<T> {
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

      // @ts-ignore
      throw new HTTPException(response.status, { message });
    }

    return data as T;
  }

  return { request, requestUnwrap };
};
