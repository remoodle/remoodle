import type {
  Course,
  ExtendedCourse,
  MoodleUser,
  HealthResponse,
} from "@remoodle/types";

type InternalOptions = {
  secret: string;
  moodleId: number;
};

type Auth = string | InternalOptions;

export class RMC {
  private host: string;

  private auth?: Auth;

  constructor(host: string, auth?: Auth) {
    this.host = host;
    this.auth = auth;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit,
  ): Promise<[T, null] | [null, Error]> {
    try {
      const url = new URL(endpoint, this.host);

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(this.auth &&
            (typeof this.auth === "string"
              ? {
                  "Auth-Token": this.auth,
                }
              : {
                  "X-Remoodle-Internal-Token": this.auth.secret,
                  "X-Remoodle-Moodle-Id": `${this.auth.moodleId}`,
                })),
        },
      });

      if (!response.ok) {
        return [null, new Error(response.statusText)];
      }

      return [(await response.json()) as T, null];
    } catch (err: any) {
      return [null, new Error(err.message)];
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

  async getCourseContent(courseId: string) {
    return this.request<Course>(`v1/course/${courseId}`, {
      method: "GET",
    });
  }
}
