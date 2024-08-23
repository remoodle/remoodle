<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { Error } from "@/entities/page";
import { CourseListCard } from "@/entities/course";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { Skeleton } from "@/shared/ui/skeleton";
import type { ExtendedCourse } from "@remoodle/types";
import { createAsyncProcess, isDefined, partition } from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";

const toggledCourseCategories = defineModel<string[]>("categories", {
  required: true,
});

const courses = ref<{
  [category: string]: ExtendedCourse[] | undefined;
}>();

const courseCategories = computed(() => Object.keys(courses.value || {}));

const { run, loading, error } = createAsyncProcess(async () => {
  const [data, error] = await request((client) =>
    client.v1.courses.overall.$get(
      {},
      {
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    throw error;
  }

  courses.value = partition(data, ({ coursecategory }) => coursecategory);

  !toggledCourseCategories.value.length &&
    toggledCourseCategories.value.push(...courseCategories.value);
});

onMounted(run);
</script>

<template>
  <template v-if="loading">
    <div class="space-y-3">
      <div class="flex gap-2">
        <Skeleton class="h-9 w-24" />
        <Skeleton class="h-9 w-24" />
      </div>
      <div class="flex flex-col gap-3">
        <Skeleton class="h-20 w-full" v-for="i in 5" :key="i" />
      </div>
    </div>
  </template>
  <template v-else-if="error || !isDefined(courses)">
    <Error @retry="run" />
  </template>
  <template v-else>
    <template v-if="courseCategories.length > 1">
      <ToggleGroup
        class="flex flex-wrap items-start justify-start"
        v-model="toggledCourseCategories"
        type="multiple"
        variant="primary"
      >
        <ToggleGroupItem
          v-for="category in courseCategories"
          :key="category"
          :value="category"
          :aria-label="`Toggle ${category}`"
        >
          {{ category }}
        </ToggleGroupItem>
      </ToggleGroup>
      <div class="py-2" />
    </template>
    <div class="flex flex-col gap-3">
      <CourseListCard
        v-for="course in toggledCourseCategories.flatMap(
          (category) => (courses && courses[category]) || [],
        )"
        :key="course.course_id"
        :course="course"
        :show-category="toggledCourseCategories.length > 1"
      />
    </div>
  </template>
</template>
