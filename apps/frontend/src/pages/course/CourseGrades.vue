<script setup lang="ts">
import type { MoodleGrade } from "@remoodle/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Text } from "@/shared/ui/text";
import { Link } from "@/shared/ui/link";
import { RouteName } from "@/shared/lib/routes";

defineOptions({
  name: "CourseGrades",
});

defineProps<{
  courseId: string;
  grades: MoodleGrade[] | undefined;
  assignmentIds: number[] | undefined;
}>();
</script>

<template>
  <template v-if="grades">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="min-w-40">Grade Item</TableHead>
          <TableHead>Grade</TableHead>
          <TableHead>Percentage</TableHead>
          <TableHead class="min-w-16">Range</TableHead>
          <TableHead class="min-w-60 text-center"> Feedback </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-for="item in grades" :key="item.id">
          <TableRow
            v-if="item.itemtype !== 'category' && item.itemtype !== 'course'"
          >
            <TableCell class="font-medium">
              <component
                :is="
                  item.itemmodule === 'assign' &&
                  item.iteminstance &&
                  assignmentIds &&
                  assignmentIds?.includes(item.iteminstance)
                    ? Link
                    : 'span'
                "
                :to="{
                  name: RouteName.Assignment,
                  params: {
                    courseId: courseId,
                    assignmentId: item.iteminstance,
                  },
                }"
                hover
                underline
              >
                {{ item.itemname }}
              </component>
            </TableCell>
            <TableCell>
              {{ item.graderaw }}
            </TableCell>
            <TableCell> {{ item.gradeformatted }} % </TableCell>
            <TableCell> {{ item.grademin }} - {{ item.grademax }} </TableCell>
            <TableCell class="text-left">
              <Text :msg="item.feedback" />
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </template>
</template>
