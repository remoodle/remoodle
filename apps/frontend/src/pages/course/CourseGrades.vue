<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Link } from "@/shared/ui/link";
import type { CourseGradeItem } from "@remoodle/types";
import { RouteName } from "@/shared/lib/routes";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";

defineOptions({
  name: "CourseGrades",
});

const props = defineProps<{
  courseId: string;
  loadingCourse: boolean;
  assignmentIds: number[] | undefined;
}>();

const grades = ref<CourseGradeItem[]>();

const updateGrade = (data: CourseGradeItem[] | undefined) => {
  grades.value = data;
};

const {
  run: fetchGrades,
  loading,
  error,
} = createAsyncProcess(async (id: string) => {
  const [data, error] = await request((client) =>
    client.v1.course[":courseId"].grades.$get(
      {
        param: { courseId: id },
      },
      {
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    throw error;
  }

  updateGrade(data);
});

onMounted(async () => {
  await fetchGrades(props.courseId);
});
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
        <template v-for="item in grades" :key="item.grade_id">
          <TableRow
            v-if="item.itemtype !== 'category' && item.itemtype !== 'course'"
          >
            <!-- {{ item }} -->
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
                <!-- {{ item }} -->
                {{ item.name }}
              </component>
              <!-- <Link>
               </Link> -->
            </TableCell>
            <TableCell>
              {{ item.graderaw }}
            </TableCell>
            <TableCell> {{ item.percentage }} % </TableCell>
            <TableCell> {{ item.grademin }} - {{ item.grademax }} </TableCell>
            <TableCell class="text-left">
              {{ item.feedback }}
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </template>
</template>
