import { useUserStore } from "@/shared/stores/user";
import { request } from "./rpc";

class API {
  private getAuthHeaders() {
    const userStore = useUserStore();

    return {
      Authorization: `Bearer ${userStore.accessToken}`,
    };
  }

  async register(payload: {
    token: string;
    email?: string;
    password?: string;
  }) {
    return request((client) =>
      client.v1.auth.register.$post({
        json: {
          moodleToken: payload.token,
          email: payload.email,
          password: payload.password,
        },
      }),
    );
  }

  async login(payload: { identifier: string; password: string }) {
    return request((client) =>
      client.v1.auth.login.$post({
        json: {
          identifier: payload.identifier,
          password: payload.password,
        },
      }),
    );
  }

  async deleteUser() {
    return request((client) =>
      client.v1.goodbye.$delete(
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getUserSettings() {
    return request((client) =>
      client.v1.user.settings.$get(
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async updateUserSettings({
    handle,
    password,
  }: {
    handle?: string;
    password?: string;
  }) {
    return request((client) =>
      client.v1.user.settings.$post(
        {
          json: {
            handle,
            password,
          },
        },
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getDeadlines() {
    return request((client) =>
      client.v1.deadlines.$get(
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getActiveCourses() {
    return request((client) =>
      client.v1.courses.$get(
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getCoursesOverall() {
    return request((client) =>
      client.v1.courses.overall.$get(
        {},
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getCourseContent(courseId: string, signal?: AbortSignal) {
    return request((client) =>
      client.v1.course[":courseId"].$get(
        {
          param: { courseId },
          query: { content: "1" },
        },
        {
          init: { signal },
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getCourseAssignments(courseId: string, signal?: AbortSignal) {
    return request((client) =>
      client.v1.course[":courseId"].assignments.$get(
        {
          param: { courseId },
        },
        {
          init: { signal },
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }

  async getCourseGrades(courseId: string) {
    return request((client) =>
      client.v1.course[":courseId"].grades.$get(
        {
          param: { courseId },
        },
        {
          headers: this.getAuthHeaders(),
        },
      ),
    );
  }
}

export const api = new API();
