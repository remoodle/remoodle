<script setup lang="ts">
import type {
  MoodleCourseContent,
  MoodleCourseContentModule,
} from "@remoodle/types";
import CourseContentModule from "./CourseContentModule.vue";
import ContentGrid from "./ContentGrid.vue";
import { Text } from "@/shared/ui/text";

defineProps<{
  courseId: number;
  content: MoodleCourseContent;
  token: string;
}>();

const getPriority = (modname: string): number => {
  const order = ["attendance", "assign", "quiz", "resource", "forum"];

  const index = order.indexOf(modname);

  return index === -1 ? order.length : index;
};

const moduleSorter = (
  a: MoodleCourseContentModule,
  b: MoodleCourseContentModule,
) => {
  if (!a.modname || !b.modname) {
    return 0;
  }

  const priorityA = getPriority(a.modname);
  const priorityB = getPriority(b.modname);

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  const aHasDescription = !!a.description;
  const bHasDescription = !!b.description;
  if (aHasDescription && !bHasDescription) {
    return 1;
  } else if (!aHasDescription && bHasDescription) {
    return -1;
  }

  return 0;
};
</script>

<template>
  <div v-show="content.visible === 1" class="space-y-5">
    <a
      :id="`${content.id}`"
      :href="`#${content.id}`"
      :aria-label="`Permalink to ${content.name}`"
      tabindex="-1"
      class="group text-2xl text-primary"
      v-show="content.section !== 0"
    >
      {{ content.name }}
    </a>
    <Text
      v-if="content.summary.length"
      :msg="content.summary"
      class="prose text-foreground"
    />
    <ContentGrid>
      <template
        v-for="item in [...content.modules].sort(moduleSorter)"
        :key="item.id"
      >
        <CourseContentModule
          :course-id="courseId"
          :module="item"
          :token="token"
        />
      </template>
    </ContentGrid>
  </div>
</template>
