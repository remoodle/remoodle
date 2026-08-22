<script setup lang="ts">
import { Badge } from "@/components/ui/badge";
import type { ScheduleFilter } from "@/lib/types";

const props = defineProps<{
  group: string;
  courses: string[];
}>();

const filters = defineModel<ScheduleFilter>({ required: true });
</script>

<template>
  <div class="flex flex-col space-y-3">
    <section class="flex flex-col space-y-2">
      <span>Toggle Event Types</span>

      <div class="flex flex-wrap gap-2">
        <Badge
          :variant="filters.eventTypes.lecture ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="filters.eventTypes.lecture = !filters.eventTypes.lecture"
        >
          lecture
        </Badge>
        <Badge
          :variant="filters.eventTypes.practice ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="filters.eventTypes.practice = !filters.eventTypes.practice"
        >
          practice
        </Badge>
        <Badge
          :variant="filters.eventTypes.learn ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="filters.eventTypes.learn = !filters.eventTypes.learn"
        >
          learn
        </Badge>
      </div>
    </section>

    <section class="flex flex-col space-y-2">
      <span>Toggle Event Formats</span>

      <div class="flex flex-wrap gap-2">
        <Badge
          :variant="filters.eventFormats.online ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="filters.eventFormats.online = !filters.eventFormats.online"
        >
          online
        </Badge>
        <Badge
          :variant="filters.eventFormats.offline ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="filters.eventFormats.offline = !filters.eventFormats.offline"
        >
          offline
        </Badge>
      </div>
    </section>

    <section class="flex flex-col space-y-2">
      <span>Toggle Courses</span>

      <div class="flex flex-wrap gap-2">
        <Badge
          v-for="course in props.courses"
          :key="course"
          :variant="!filters.excludedCourses.includes(course) ? 'default' : 'destructive'"
          class="cursor-pointer"
          @click="
            filters.excludedCourses.includes(course)
              ? (filters.excludedCourses = filters.excludedCourses.filter((c) => c !== course))
              : filters.excludedCourses.push(course)
          "
        >
          {{ course }}
        </Badge>
      </div>
    </section>
  </div>
</template>
