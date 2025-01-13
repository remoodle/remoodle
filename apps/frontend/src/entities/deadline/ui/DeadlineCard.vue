<script setup lang="ts">
import type { MoodleEvent } from "@remoodle/types";
import { RouteName } from "@/shared/lib/routes";
import {
  splitCourseName,
  formatAssignmentName,
  formatDate,
  fromUnix,
  getRelativeTime,
} from "@/shared/lib/helpers";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Link } from "@/shared/ui/link";

defineProps<{
  deadline: MoodleEvent;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-col">
      <component
        :is="
          deadline.component === 'mod_assign' && deadline.instance
            ? Link
            : 'span'
        "
        :to="
          deadline.instance
            ? {
                name: RouteName.Assignment,
                params: {
                  courseId: deadline.course.id,
                  assignmentId: deadline.instance,
                },
                query: {
                  courseName: deadline.course.fullname,
                },
              }
            : undefined
        "
        hover
        class="truncate"
      >
        {{ formatAssignmentName(deadline.name) }}
      </component>
      <Link
        :to="{
          name: RouteName.Course,
          params: { courseId: deadline.course.id },
          query: {
            courseName: deadline.course.fullname,
          },
        }"
        hover
        class="truncate text-sm"
      >
        {{ splitCourseName(deadline.course.fullname).name }}
      </Link>
    </div>
    <span class="flex-shrink-0 text-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {{ getRelativeTime(fromUnix(deadline.timestart)) }}
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ formatDate(fromUnix(deadline.timestart), "full") }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  </div>
</template>
