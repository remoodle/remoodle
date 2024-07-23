import ky, { HTTPError, type Options } from "ky";
import type {
  APIError,
  APIWrapper,
  ActiveCourse,
  ExtendedCourse,
  Deadline,
  MoodleUser,
  UserSettings,
  Course,
  Assignment,
  CourseGradeItem,
} from "@/shared/types";
import { isDefined, isEmptyString } from "@/shared/utils";
import { useUserStore } from "@/shared/stores/user";
import { useAppStore } from "@/shared/stores/app";

class API {
  kyInstance;

  constructor() {
    this.kyInstance = ky.create({
      retry: { limit: 1 },
      hooks: {
        beforeRequest: [
          (request) => {
            const userStore = useUserStore();
            const token = userStore.token;

            if (isDefined(token) && !isEmptyString(token)) {
              request.headers.set("Auth-Token", token);
            }

            request.headers.set("Connection", "keep-alive");
          },
        ],
        afterResponse: [
          (_input, _options, response) => {
            if (response.status === 401) {
              const userStore = useUserStore();

              userStore.logout();
            }
          },
        ],
      },
    });
  }

  private async request<T>(
    input: RequestInfo,
    options?: Options,
  ): Promise<[T, null] | [null, APIError]> {
    try {
      const response = await this.kyInstance(input, options).json<
        APIWrapper<T>
      >();

      return [response as T, null];
    } catch (err) {
      try {
        if (err instanceof HTTPError) {
          const response = await err.response.json();

          if ("error" in response) {
            return [
              null,
              {
                status: err.response.status,
                message: response.error,
              },
            ];
          }
        }
      } catch (_) {
        return [null, { status: 500, message: "Couldn't parse error" }];
      }

      return [null, { status: 500, message: "Something went wrong" }];
    }
  }

  private prepareURL(path: string) {
    const appStore = useAppStore();

    if (!appStore.selectedProvider) {
      alert("API Provider is not set");
      return path;
    }

    const host = appStore.selectedProvider.api;

    return `${host}/v1/${path}`;
  }

  async register(payload: {
    token: string;
    name_alias?: string;
    password?: string;
    email?: string;
  }) {
    return this.request<MoodleUser>(this.prepareURL("auth/register"), {
      method: "POST",
      json: payload,
    });
  }

  async login(payload: { identifier: string; password: string }) {
    return this.request<
      UserSettings & {
        moodle_token: string;
      }
    >(this.prepareURL("auth/password"), {
      method: "POST",
      json: payload,
    });
  }

  async authorize(token: string) {
    return this.request<
      UserSettings & {
        moodle_token: string;
      }
    >(this.prepareURL("auth/token"), {
      method: "POST",
      json: { token },
    });
  }

  async deleteUser() {
    return this.request<{}>(this.prepareURL("user"), {
      method: "DELETE",
    });
  }

  async getUserSettings() {
    return this.request<UserSettings>(this.prepareURL("user/settings"), {
      method: "GET",
    });
  }

  async updateUserSettings({
    name_alias,
    password,
    deadlines_notification,
    grades_notification,
  }: {
    name_alias?: string;
    password?: string;
    deadlines_notification?: boolean;
    grades_notification?: boolean;
  }) {
    return this.request<UserSettings>(this.prepareURL("user/settings"), {
      method: "POST",
      json: {
        name_alias,
        password,
        deadlines_notification,
        grades_notification,
      },
    });
  }

  async getDeadlines() {
    return this.request<Deadline[]>(this.prepareURL("user/deadlines"), {
      method: "GET",
    });
  }

  async getActiveCourses() {
    return this.request<ActiveCourse[]>(this.prepareURL("user/courses"), {
      method: "GET",
    });
  }

  async getCoursesOverall() {
    return this.request<ExtendedCourse[]>(
      this.prepareURL("user/courses/overall"),
      {
        method: "GET",
      },
    );
  }

  async getCourseContent(courseId: string, signal?: AbortSignal) {
    return this.request<Course>(this.prepareURL(`course/${courseId}`), {
      method: "GET",
      signal,
      searchParams: {
        content: 1,
      },
    });
  }

  async getCourseAssignments(courseId: string, signal?: AbortSignal) {
    return this.request<Assignment[]>(
      this.prepareURL(`course/${courseId}/assignments`),
      {
        method: "GET",
        signal,
      },
    );
  }

  async getCourseGrades(courseId: string) {
    return this.request<CourseGradeItem[]>(
      this.prepareURL(`user/course/${courseId}/grades`),
      {
        method: "GET",
      },
    );
  }
}

export const api = new API();
