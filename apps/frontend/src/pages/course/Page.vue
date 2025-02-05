<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import type { Course } from "@remoodle/types";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { useUserStore } from "@/shared/stores/user";
import { RouterNav } from "@/shared/ui/router-nav";
import { Link } from "@/shared/ui/link";
import { Skeleton } from "@/shared/ui/skeleton";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import { isDefined, cn } from "@/shared/lib/helpers";
import { RouteName } from "@/shared/lib/routes";
import CourseOverview from "./CourseOverview.vue";
import CourseGrades from "./CourseGrades.vue";
import CourseAssignment from "./CourseAssignment.vue";

const route = useRoute();
const courseId = computed(() => route.params.courseId as string);
const assignmentId = computed(() => route.params.assignmentId as string);

const courseName = ref("");

onMounted(async () => {
  if (route.query.courseName) {
    courseName.value = route.query.courseName as string;
  }
});

const userStore = useUserStore();

const { isPending: loading, data: course } = useQuery<Course>({
  queryKey: ["course", courseId],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.course[":courseId"].$get(
        {
          param: { courseId: courseId.value },
          query: { content: "1" },
        },
        { headers: getAuthHeaders() },
      ),
    ),
});

watchEffect(() => {
  if (!course.value) {
    return;
  }

  const hash = route.hash;

  if (hash) {
    setTimeout(() => {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
      }
    }, 100);
  }
});

const {
  isPending: loadingAssignments,
  data: assignments,
  error: assignmentsError,
} = useQuery({
  queryKey: ["course-assignments", courseId],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.course[":courseId"].assignments.$get(
        {
          param: { courseId: courseId.value },
        },
        { headers: getAuthHeaders() },
      ),
    ),
});

const {
  isPending: loadingGrades,
  data: grades,
  error: gradesError,
} = useQuery({
  queryKey: ["course-grades", courseId],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.course[":courseId"].grades.$get(
        {
          param: { courseId: courseId.value },
        },
        { headers: getAuthHeaders() },
      ),
    ),
});
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
              <template v-if="loadingAssignments">
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
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
