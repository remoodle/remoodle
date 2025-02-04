<script setup lang="ts">
import { computed } from "vue";
import type { ExtendedCourse } from "@remoodle/types";
import { RouteName } from "@/shared/lib/routes";
import { splitCourseName } from "@/shared/lib/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Link } from "@/shared/ui/link";
import { Icon } from "@/shared/ui/icon";

const props = defineProps<{
  course: ExtendedCourse;
  showCategory: boolean;
}>();

const splitted = computed(() => {
  return splitCourseName(props.course.fullname);
});

const attendance = computed(() => {
  return props.course.grades?.find((g) => g.itemmodule === "attendance");
});
</script>

<template>
  <Link
    :to="{
      name: RouteName.Course,
      params: { courseId: course.id },
      query: { courseName: course.fullname },
    }"
    class="flex items-center justify-between gap-x-2 rounded-lg bg-secondary px-4 py-4 text-left transition-all hover:bg-secondary"
  >
    <div class="flex flex-col">
      <div v-show="showCategory" class="text-xs text-muted-foreground">
        {{ course.coursecategory }}
      </div>
      <span class="text-lg font-medium">
        {{ splitted.name }}
      </span>
      <div class="text-sm text-muted-foreground">
        {{ splitted.teacher }}
      </div>
    </div>
    <div v-if="course.grades" class="flex flex-none gap-1">
      <TooltipProvider v-if="typeof attendance?.graderaw === 'number'">
        <Tooltip>
          <TooltipTrigger>
            <div class="flex items-center gap-2 rounded-md p-1 md:p-2">
              <Icon name="people" class="h-4 w-4 flex-none md:h-5 md:w-5" />
              {{ attendance.gradeformatted }}%
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Attendance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  </Link>
</template>
