<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { useUserStore } from "@/shared/stores/user";
import { RouterNav } from "@/shared/ui/router-nav";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { useToast } from "@/shared/ui/toast";
import { Link } from "@/shared/ui/link";
import type { Grade, CourseGradeItem } from "@remoodle/types";
import { RouteName } from "@/shared/types";
import {
  createAsyncProcess,
  isDefined,
  splitCourseName,
} from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";

defineOptions({
  name: "CourseGrades",
});

const props = defineProps<{
  courseId: string;
  loadingCourse: boolean;
  assignmentIds: number[] | undefined;
}>();

const router = useRouter();

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
  <!-- {{ loadingCourse }}
  {{ grades }} -->
  <div class="p-6">
    <Table v-if="grades">
      <!-- <TableCaption>A list of your recent invoices.</TableCaption> -->
      <TableHeader>
        <TableRow>
          <TableHead class="w-[300px]"> Grade Item </TableHead>
          <TableHead> Grade </TableHead>
          <TableHead>Percentage</TableHead>
          <TableHead>Range</TableHead>
          <TableHead class="w-[20px] text-right"> Feedback </TableHead>
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
            <TableCell>
              {{ item.percentage }}
            </TableCell>
            <TableCell> {{ item.grademin }} - {{ item.grademax }} </TableCell>
            <TableCell class="text-right">
              {{ item.feedback }}
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
    <!-- {{ grades }} -->
    <!-- <div v-if="grades">
      <pre
        >{{ JSON.stringify(grades, null, 2) }}
  </pre
      >
   
    </div> -->
  </div>
</template>
