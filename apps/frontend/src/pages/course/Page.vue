<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { useUserStore } from "@/shared/stores/user";
import { RouterNav } from "@/shared/ui/router-nav";
import { Link } from "@/shared/ui/link";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import {
  createAsyncProcess,
  isDefined,
  insertIf,
  cn,
} from "@/shared/lib/helpers";
import type { Course, Assignment } from "@remoodle/types";
import { useBreakpoints } from "@/shared/lib/use-breakpoints";
import { RouteName } from "@/shared/lib/routes";
import CourseOverview from "./CourseOverview.vue";
import CourseGrades from "./CourseGrades.vue";
import CourseAssignment from "./CourseAssignment.vue";

const route = useRoute();
const courseId = computed(() => route.params.courseId as string);
const assignmentId = computed(() => route.params.assignmentId as string);

const courseName = ref("");

const { lgOrLarger } = useBreakpoints();

const abortController = new AbortController();
const signal = abortController.signal;

const course = ref<Course>();
const updateCourse = (data: Course | undefined) => {
  course.value = data;

  if (data) {
    courseName.value = data.name;
  }
};
const {
  run: fetchCourse,
  loading,
  error,
} = createAsyncProcess(async (id: string, signal: AbortSignal) => {
  updateCourse(undefined);

  const [data, error] = await request((client) =>
    client.v1.course[":courseId"].$get(
      {
        param: { courseId: id },
        query: { content: "1" },
      },
      {
        init: { signal },
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    throw error;
  }

  updateCourse(data);
});
const loadCourse = async () => {
  await fetchCourse(courseId.value, signal);

  const hash = route.hash;

  if (hash) {
    setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
      }
    }, 100);
  }
};

const assignments = ref<Assignment[]>();
const updateAssignments = (data: Assignment[] | undefined) => {
  assignments.value = data;
};
const {
  run: fetchAssignments,
  loading: loadingAssignments,
  error: assignmentsError,
} = createAsyncProcess(async (id: string, signal: AbortSignal) => {
  updateAssignments(undefined);

  const [data, error] = await request((client) =>
    client.v1.course[":courseId"].assignments.$get(
      {
        param: { courseId: id },
      },
      {
        init: { signal },
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    throw error;
  }

  updateAssignments(data);
});
const loadAssignments = async () => {
  await fetchAssignments(courseId.value, signal);

  const id = assignmentId.value;

  if (id && !lgOrLarger.value) {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView();
      }
    }, 100);
  }
};
const assignment = computed(() => {
  if (!assignmentId.value) {
    return undefined;
  }

  return assignments.value?.find(
    (a) => `${a.assignment_id}` === assignmentId.value,
  );
});

onMounted(async () => {
  if (route.query.courseName) {
    courseName.value = route.query.courseName as string;
  }

  await Promise.all([
    loadCourse(),
    loadAssignments(),
    // ...insertIf(route.name === RouteName.Assignment, loadAssignments()),
  ]);
});

onBeforeUnmount(() => {
  abortController.abort();
});

const userStore = useUserStore();

const { preferences } = storeToRefs(userStore);
</script>

<template>
  <PageWrapper sticky-header>
    <template #title>
      <h1>
        <template v-if="!courseName && loading && !isDefined(course)">
          Loading...
        </template>
        <template v-else>
          {{ courseName }}
        </template>
      </h1>
    </template>
    <template #island>
      <!-- <nav
        class="flex flex-row flex-nowrap gap-2 overflow-x-auto overflow-y-hidden rounded-2xl bg-background px-6 shadow"
        style="-webkit-overflow-scrolling: touch"
      >
        <div
          ref="elRouterNav"
          class="flex h-14 w-full flex-row gap-x-3 [&>*]:relative [&>*]:flex [&>*]:h-full [&>*]:flex-shrink-0 [&>*]:items-center [&>*]:gap-1 [&>*]:px-2 [&>*]:no-underline [&>*]:before:absolute [&>*]:before:left-0 [&>*]:before:top-[95%] [&>*]:before:z-[0] [&>*]:before:hidden [&>*]:before:h-1 [&>*]:before:w-full [&>*]:before:rounded [&>*]:before:bg-primary [&>*]:before:content-[''] [&>.router-link-exact-active]:before:block"
        >
          <Link :to="{ name: RouteName.Course }"> Overview </Link>
          <Link :to="{ name: RouteName.Grades }"> Grades </Link>
          <Link
            v-for="item in assignments"
            :key="item.assignment_id"
            :id="item.assignment_id"
            class="max-w-36"
            :to="{
              name: RouteName.Assignment,
              params: { courseId, assignmentId: item.assignment_id },
            }"
          >
            <span class="line-clamp-2">
              {{ item.name }}
            </span>
          </Link>
        </div>
      </nav> -->
      <RouterNav :bordered="false" padding rounded shadow>
        <Link :to="{ name: RouteName.Course }"> Overview </Link>
        <Link :to="{ name: RouteName.Grades }"> Grades </Link>
        <!-- <Link
          v-for="item in assignments"
          :key="item.assignment_id"
          :id="item.assignment_id"
          class="max-w-36"
          :to="{
            name: RouteName.Assignment,
            params: { courseId, assignmentId: item.assignment_id },
          }"
        >
          <span class="line-clamp-2">
            {{ item.name }}
          </span>
        </Link> -->
      </RouterNav>
    </template>
    <RoundedSection dense>
      <div
        class="flex flex-col space-y-4 lg:flex-row lg:space-x-12 lg:space-y-0"
      >
        <aside class="mt-6 h-32 rounded-2xl border p-2 lg:h-fit lg:w-1/5">
          <ScrollArea class="h-full">
            <nav class="flex flex-wrap lg:flex-col">
              <template v-if="loading">
                <Skeleton v-for="i in 4" :key="i" class="my-1 h-9 w-full" />
              </template>
              <template v-else-if="assignments?.length">
                <Link
                  v-for="item in assignments"
                  :key="item.assignment_id"
                  :id="item.assignment_id"
                  :to="{
                    name: RouteName.Assignment,
                    params: { courseId, assignmentId: item.assignment_id },
                  }"
                  class="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  :class="
                    cn(
                      'w-full justify-start text-left',
                      assignmentId === `${item.assignment_id}` && 'bg-muted',
                    )
                  "
                >
                  {{ item.name }}
                </Link>
              </template>
            </nav>
          </ScrollArea>
        </aside>
        <div class="flex-1 p-1 lg:p-5">
          <KeepAlive
            :include="['CourseOverview', 'CourseGrades', 'CourseAssignment']"
          >
            <template v-if="route.name === RouteName.Course">
              <CourseOverview
                :course-id="Number(courseId)"
                :content="course?.content"
              />
            </template>
            <template v-else-if="route.name === RouteName.Grades">
              <CourseGrades
                :course-id="courseId"
                :loading-course="loading"
                :assignment-ids="assignments?.map((a) => a.assignment_id)"
              />
            </template>
            <template v-else-if="route.name === RouteName.Assignment">
              <CourseAssignment
                :assignment="assignment"
                :loading-assignments="loadingAssignments"
                :token="userStore.accessToken"
              />
            </template>
          </KeepAlive>
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
