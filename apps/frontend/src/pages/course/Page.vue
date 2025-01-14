<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import type { Course, MoodleAssignment, MoodleGrade } from "@remoodle/types";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { useUserStore } from "@/shared/stores/user";
import { RouterNav } from "@/shared/ui/router-nav";
import { Link } from "@/shared/ui/link";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess, isDefined, cn } from "@/shared/lib/helpers";
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
    courseName.value = data.fullname;
  }
};
const {
  run: fetchCourse,
  loading,
  error,
} = createAsyncProcess(async (id: string, signal: AbortSignal) => {
  updateCourse(undefined);

  const [data, error] = await request((client) =>
    client.v2.course[":courseId"].$get(
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

const assignments = ref<MoodleAssignment[]>();
const updateAssignments = (data: MoodleAssignment[] | undefined) => {
  assignments.value = data;
};
const {
  run: fetchAssignments,
  loading: loadingAssignments,
  error: assignmentsError,
} = createAsyncProcess(async (id: string, signal: AbortSignal) => {
  updateAssignments(undefined);

  const [data, error] = await request((client) =>
    client.v2.course[":courseId"].assignments.$get(
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

const grades = ref<MoodleGrade[]>();

const updateGrades = (data: MoodleGrade[] | undefined) => {
  grades.value = data;
};

const {
  run: loadGrades,
  loading: loadingGrades,
  error: gradesError,
} = createAsyncProcess(async () => {
  const [data, error] = await request((client) =>
    client.v2.course[":courseId"].grades.$get(
      {
        param: { courseId: courseId.value },
      },
      {
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    throw error;
  }

  updateGrades(data);
});

onMounted(async () => {
  if (route.query.courseName) {
    courseName.value = route.query.courseName as string;
  }

  await Promise.all([loadCourse(), loadAssignments(), loadGrades()]);
});

onBeforeUnmount(() => {
  abortController.abort();
});

const userStore = useUserStore();
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
      <RouterNav :bordered="false" padding rounded shadow>
        <Link :to="{ name: RouteName.Course }"> Overview </Link>
        <Link :to="{ name: RouteName.Grades }"> Grades </Link>
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
                  :key="item.cmid"
                  :id="item.cmid"
                  :to="{
                    name: RouteName.Assignment,
                    params: { courseId, assignmentId: item.cmid },
                  }"
                  class="rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted"
                  :class="
                    cn(
                      'w-full justify-start text-left',
                      assignmentId === `${item.cmid}` && 'bg-muted',
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
                :grades
                :assignment-ids="assignments?.map((a) => a.cmid)"
              />
            </template>
            <template v-else-if="route.name === RouteName.Assignment">
              <CourseAssignment
                :assignment-id
                :assignments
                :grades
                :token="userStore.accessToken"
              />
            </template>
          </KeepAlive>
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
