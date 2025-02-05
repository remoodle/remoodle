<script setup lang="ts">
import type { MoodleCourseContent } from "@remoodle/types";
import { CourseContentCard, ContentGrid } from "@/entities/course";
import { Skeleton } from "@/shared/ui/skeleton";
import { getRandomInt } from "@/shared/lib/helpers";
import { useUserStore } from "@/shared/stores/user";

defineProps<{
  courseId: number;
  content?: MoodleCourseContent[];
}>();

const userStore = useUserStore();
</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <template v-if="content">
      <template v-for="item in content" :key="item.id">
        <CourseContentCard
          :course-id="courseId"
          :content="item"
          :token="userStore.accessToken"
        />
        <hr />
      </template>
    </template>
    <template v-else>
      <div class="py-1" />
      <template v-for="i in 4" :key="i">
        <ContentGrid>
          <Skeleton v-for="j in getRandomInt(2, 5)" :key="j" class="h-12" />
        </ContentGrid>
      </template>
    </template>
  </div>
</template>
