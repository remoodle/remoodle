<script setup lang="ts">
import { Checkbox } from "@/components/ui/checkbox";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import {
  defaultCourseFilter,
  type CourseScheduleFilter,
  type ScheduleFilter,
} from "../../shared/schedule";

const props = defineProps<{ courses: string[]; modelValue: ScheduleFilter["courses"] }>();

const emit = defineEmits<{ "update:modelValue": [value: ScheduleFilter["courses"]] }>();

function courseFilter(course: string): CourseScheduleFilter {
  return props.modelValue[course] ?? defaultCourseFilter();
}

function setCourseFilter(course: string, key: keyof CourseScheduleFilter, value: boolean) {
  emit("update:modelValue", {
    ...props.modelValue,
    [course]: { ...courseFilter(course), [key]: value },
  });
}
</script>

<template>
  <SidebarGroup>
    <SidebarGroupContent>
      <div class="flex flex-col gap-1 px-1">
        <div
          v-for="course in courses"
          :key="course"
          class="rounded-md px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <label class="flex cursor-pointer items-start gap-2.5 text-sm font-medium">
            <Checkbox
              class="mt-0.5"
              :model-value="courseFilter(course).enabled"
              @update:model-value="setCourseFilter(course, 'enabled', $event === true)"
            />
            <span class="leading-tight">{{ course }}</span>
          </label>
          <div
            class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 pl-7 text-xs text-muted-foreground"
            :class="{ 'opacity-45': !courseFilter(course).enabled }"
          >
            <label
              v-for="key in ['lecture', 'practice', 'online', 'offline'] as const"
              :key="key"
              class="flex cursor-pointer items-center gap-2 capitalize"
            >
              <Checkbox
                class="size-3.5"
                :disabled="!courseFilter(course).enabled"
                :model-value="courseFilter(course)[key]"
                @update:model-value="setCourseFilter(course, key, $event === true)"
              />
              {{ key }}
            </label>
          </div>
        </div>
      </div>
    </SidebarGroupContent>
  </SidebarGroup>
</template>
