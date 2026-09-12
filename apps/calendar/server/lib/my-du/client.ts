import { credentialsSchema, parseMyDuResponse, type MyDuCredentials } from "./schemas";

export const MY_DU_ORIGIN = "https://my-du.astanait.edu.kz";

export class MyDuConnectionError extends Error {
  public readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = "MyDuConnectionError";
    this.cause = options?.cause;
  }
}

type ExternalLoginRequest = {
  provider: string;
  token: string;
  email: null;
  device_info: { platform: string; device_id: null };
  avatar_url: null;
  first_name: null;
  last_name: null;
};

type ScheduleSearchRequest = {
  filters: Array<{ id: string; value: string }>;
  start: number;
  size: number;
};

type RequestBody = ExternalLoginRequest | ScheduleSearchRequest | Record<never, never>;

async function request(path: string, credentials?: MyDuCredentials, body?: RequestBody) {
  const headers = new Headers({ Accept: "application/json" });

  if (body !== undefined) headers.set("Content-Type", "application/json");

  if (credentials) {
    headers.set(
      "Cookie",
      `access_token=${credentials.access_token}; refresh_token=${credentials.refresh_token}`,
    );
  }

  let response: Response;

  try {
    response = await fetch(`${MY_DU_ORIGIN}/api${path}${path.includes("?") ? "&" : "?"}lang=en`, {
      method: body === undefined ? "GET" : "POST",
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Never forward credential cookies to a redirect target.
      redirect: "manual",
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    throw new MyDuConnectionError("Could not reach My DU.", { cause: error });
  }

  if (response.status >= 300 && response.status < 400) {
    throw new Error("My DU returned an unexpected redirect.");
  }

  return response;
}

export async function exchangeLoginCode(code: string) {
  const response = await request("/auth/external-login", undefined, {
    provider: "microsoft",
    token: code,
    email: null,
    device_info: { platform: "ios", device_id: null },
    avatar_url: null,
    first_name: null,
    last_name: null,
  });

  if (!response.ok) throw new Error("My DU rejected the login.");

  return parseMyDuResponse(credentialsSchema, await response.json());
}

export function createMyDuClient(
  initialCredentials: MyDuCredentials,
  onCredentialsChanged: (credentials: MyDuCredentials) => Promise<void>,
  onCredentialsRejected: () => Promise<void>,
) {
  let credentials = initialCredentials;

  return async function get(path: string, body?: RequestBody) {
    let response = await request(path, credentials, body);

    if (response.status === 401) {
      const refreshed = await request("/auth/refresh", credentials, {});

      if ([401, 403].includes(refreshed.status)) {
        await onCredentialsRejected();
        throw new Error("Reconnect My DU to update your saved classes.");
      }

      if (!refreshed.ok)
        throw new Error("My DU could not refresh your session. Try syncing again later.");
      credentials = parseMyDuResponse(credentialsSchema, await refreshed.json());
      await onCredentialsChanged(credentials);
      response = await request(path, credentials, body);
    }

    if (!response.ok) {
      throw new Error(
        `My DU schedule request failed (${response.status}). Saved classes are unchanged.`,
      );
    }

    return response.json();
  };
}
