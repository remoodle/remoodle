<script setup lang="ts">
import type { Deadline } from "@remoodle/types";
import { RouteName } from "@/shared/types";
import {
  splitCourseName,
  formatAssignmentName,
  formatDate,
  fromUnix,
  getRelativeTime,
} from "@/shared/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Link } from "@/shared/ui/link";

defineProps<{
  deadline: Deadline;
}>();
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-col">
      <component
        :is="deadline.assignment ? Link : 'span'"
        :to="{
          name: RouteName.Assignment,
          params: {
            courseId: deadline.course_id,
            assignmentId: deadline.assignment?.assignment_id,
          },
          query: {
            courseName: deadline.course_name,
          },
        }"
        hover
        class="truncate"
      >
        {{ formatAssignmentName(deadline.name) }}
      </component>
      <Link
        :to="{
          name: RouteName.Course,
          params: { courseId: deadline.course_id },
          query: {
            courseName: deadline.course_name,
          },
        }"
        hover
        class="truncate text-sm"
      >
        {{ splitCourseName(deadline.course_name).name }}
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
