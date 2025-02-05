<script setup lang="ts">
import { computed } from "vue";
import type { MoodleAssignment, MoodleGrade } from "@remoodle/types";
import { FileIcon } from "@/entities/attachment";
import { Link } from "@/shared/ui/link";
import { Text } from "@/shared/ui/text";
import {
  filesize,
  formatDate,
  fromUnix,
  prepareFileURL,
} from "@/shared/lib/helpers";

defineOptions({
  name: "CourseAssignment",
});

const props = defineProps<{
  assignmentId?: string;
  assignments?: MoodleAssignment[];
  grades?: MoodleGrade[];
  token: string;
}>();

const assignment = computed(() => {
  if (!props.assignmentId) {
    return undefined;
  }

  return props.assignments?.find((a) => `${a.cmid}` === props.assignmentId);
});

const grade = computed(() => {
  if (!props.assignmentId) {
    return undefined;
  }

  return props.grades?.find((g) => g.cmid === props.assignmentId);
});
</script>

<template>
  <template v-if="assignment">
    <span class="text-3xl">
      {{ assignment.name }}
    </span>

    <div class="my-6 flex flex-col gap-2">
      <p>
        <strong> Opened: </strong>
        <span>
          {{
            formatDate(fromUnix(assignment.allowsubmissionsfromdate), "full")
          }}
        </span>
      </p>
      <p>
        <strong> Due: </strong>
        <span>
          {{ formatDate(fromUnix(assignment.duedate), "full") }}
        </span>
      </p>
      <template v-if="grade">
        <p v-if="grade.graderaw">
          <strong> Grade: </strong>
          <span> {{ grade.gradeformatted }}% </span>
        </p>
      </template>
    </div>

    <Text class="prose prose-sm my-1 text-foreground" :msg="assignment.intro" />

    <ul v-if="assignment.introattachments.length" class="flex flex-col gap-4">
      <li
        v-for="file in assignment.introattachments"
        :key="file.filename"
        class="flex flex-col gap-0.5"
      >
        <div class="flex items-center gap-2">
          <FileIcon :mimetype="file.mimetype" class="w-5" />
          <Link
            :to="prepareFileURL(file.fileurl)"
            hover
            download="filename"
            class="text-primary"
          >
            {{ file.filename }}
          </Link>
        </div>
        <span class="pl-9 text-sm">
          {{ formatDate(fromUnix(file.timemodified), "full") }}
          ({{ filesize(file.filesize) }})
        </span>
      </li>
    </ul>
  </template>
</template>
