<script setup lang="ts">
import { CourseContentCard, ContentGrid } from "@/entities/course";
import type { CourseContent } from "@/shared/types";
import { Skeleton } from "@/shared/ui/skeleton";
import { getRandomInt } from "@/shared/utils";
import { useUserStore } from "@/shared/stores/user";

defineOptions({
  name: "CourseOverview",
});

defineProps<{
  courseId: number;
  content?: CourseContent[];
}>();

const userStore = useUserStore();

// TODO: Skeleton loading
</script>

<template>
  <div class="flex w-full flex-col gap-5">
    <template v-if="content">
      <template v-for="item in content" :key="item.id">
        <CourseContentCard
          :course-id="courseId"
          :content="item"
          :token="userStore.token"
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
