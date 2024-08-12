import { HTTPException } from "hono/http-exception";
import { StatusCode } from "hono/utils/http-status";
import type {
  Course,
  ExtendedCourse,
  MoodleUser,
  HealthResponse,
} from "@remoodle/types";
import { config } from "../../config";

type Auth = { moodleId: number } | { moodleToken: string };

export class RMC {
  private host: string;
  private secret: string;
  private auth?: Auth;

  constructor(auth?: Auth) {
    this.host = config.core.url;
    this.secret = config.core.secret;
    this.auth = auth;
  }

  private getAuthHeaders(auth: Auth): Record<string, string> {
    if ("moodleToken" in auth) {
      return {
        "Auth-Token": auth.moodleToken,
      };
    } else if ("moodleId" in auth) {
      return {
        "X-Remoodle-Internal-Token": this.secret,
        "X-Remoodle-Moodle-Id": `${auth.moodleId}`,
      };
    }
    return {};
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit,
  ): Promise<[T, null] | [null, HTTPException]> {
    try {
      const url = new URL(endpoint, this.host);

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(this.auth && this.getAuthHeaders(this.auth)),
        },
      });

      console.log({
        "Content-Type": "application/json",
        ...(this.auth && this.getAuthHeaders(this.auth)),
      });
      console.log(response);

      if (!response.ok) {
        return [
          null,
          new HTTPException(response.status as StatusCode, {
            message: response.statusText,
          }),
        ];
      }

      return [(await response.json()) as T, null];
    } catch (err: any) {
      return [null, new HTTPException(500, { message: err.message })];
    }
  }

  async health() {
    return this.request<HealthResponse>("health", {
      method: "GET",
    });
  }

  async createUser(payload: {
    token: string;
    name_alias?: string;
    password?: string;
    email?: string;
  }) {
    return this.request<MoodleUser>("v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async deleteUser() {
    return this.request<"OK">("v1/user", {
      method: "DELETE",
    });
  }

  async getUserCoursesOverall() {
    return this.request<ExtendedCourse[]>("v1/user/courses/overall", {
      method: "GET",
    });
  }

  async getCourseContent(courseId: string, content?: string) {
    return this.request<Course>(`v1/course/${courseId}?content=${content}`, {
      method: "GET",
    });
  }
}
