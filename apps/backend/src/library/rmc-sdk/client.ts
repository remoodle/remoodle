import { HTTPException } from "hono/http-exception";
import type { StatusCode } from "hono/utils/http-status";
import { compare } from "compare-versions";
import type {
  Course,
  ActiveCourse,
  ExtendedCourse,
  Assignment,
  CourseGradeItem,
  Deadline,
  MoodleUser,
  HealthResponse,
} from "@remoodle/types";
import { config } from "../../config";

type Auth = { moodleId: number } | { moodleToken: string };

export class RMC {
  private leastCompatibleVersion = "0.3.0";

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

      // eg "v0.3.1::123456"
      const version = response.headers.get("Version");

      if (version && version.startsWith("v")) {
        const semverVersion = version.slice(1).split("::")[0];

        if (compare(semverVersion, this.leastCompatibleVersion, "<")) {
          return [
            null,
            new HTTPException(400, {
              message: `Version ${version} is not supported. Please upgrade to ${this.leastCompatibleVersion} or higher.`,
            }),
          ];
        }
      }

      console.log(version);

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

  async get_health() {
    return this.request<HealthResponse>("health", {
      method: "GET",
    });
  }

  async v1_auth_register(payload: {
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

  async v1_delete_user() {
    return this.request<"OK">("v1/user", {
      method: "DELETE",
    });
  }

  async v1_user_deadlines() {
    return this.request<Deadline[]>("v1/user/deadlines", {
      method: "GET",
    });
  }

  async v1_user_courses() {
    return this.request<ActiveCourse[]>("v1/user/courses", {
      method: "GET",
    });
  }

  async v1_user_courses_overall() {
    return this.request<ExtendedCourse[]>("v1/user/courses/overall", {
      method: "GET",
    });
  }

  async v1_course_content(courseId: string, content?: string) {
    return this.request<Course>(`v1/course/${courseId}?content=${content}`, {
      method: "GET",
    });
  }

  async v1_course_assignments(courseId: string) {
    return this.request<Assignment[]>(`v1/course/${courseId}/assignments`, {
      method: "GET",
    });
  }

  async v1_user_course_grades(courseId: string) {
    return this.request<CourseGradeItem[]>(
      `v1/user/course/${courseId}/grades`,
      {
        method: "GET",
      },
    );
  }
}
