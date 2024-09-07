<script setup lang="ts">
import type { Assignment } from "@remoodle/types";
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

defineProps<{
  assignment?: Assignment;
  loadingAssignments: boolean;
  token: string;
}>();
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
      <template v-if="assignment.gradeEntity">
        <p v-if="assignment.gradeEntity.percentage">
          <strong> Grade: </strong>
          <span> {{ assignment.gradeEntity.percentage }}% </span>
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
            :to="prepareFileURL(file.fileurl, token)"
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
