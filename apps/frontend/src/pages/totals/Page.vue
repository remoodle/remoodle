<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { PageWrapper } from "@/entities/page";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Link } from "@/shared/ui/link";
import { RouteName } from "@/shared/lib/routes";
import RoundedSection from "@/entities/page/ui/RoundedSection.vue";
import { createAsyncProcess, getGpaForGrade } from "@/shared/lib/helpers";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import type { ExtendedCourse } from "@remoodle/types";
import { useToast } from "@/shared/ui/toast";

defineOptions({
  name: "TotalsPage",
});

const { toast } = useToast();

const coursesOverallGrades = ref<ExtendedCourse[]>();

const { run: loadOverallGrades } = createAsyncProcess(async () => {
  const [data, error] = await request((client) =>
    client.v1.courses.grades.overall.$get(
      {},
      {
        headers: getAuthHeaders(),
      },
    ),
  );

  if (error) {
    toast({
      title: error.message,
    });
    throw error;
  }

  coursesOverallGrades.value = data;
});

onMounted(async () => {
  await loadOverallGrades();
});

// Sorting

const sortKey = ref<string>("courseid");
const sortOrder = ref<"asc" | "desc">("asc");

const sortedOverallGrades = computed(() => {
  const key = sortKey.value as keyof ExtendedCourse | "grade" | "gpa";
  const order = sortOrder.value === "asc" ? 1 : -1;

  const grades = coursesOverallGrades.value ?? [];

  return [...grades].sort((a, b) => {
    let aValue: any = undefined;
    let bValue: any = undefined;

    if (key === "grade" || key === "gpa") {
      aValue =
        a.grades?.find(
          (item) => item.itemtype === "course" && item.name === "Total",
        )?.percentage ?? 0;
      bValue =
        b.grades?.find(
          (item) => item.itemtype === "course" && item.name === "Total",
        )?.percentage ?? 0;

      if (key === "gpa") {
        aValue = getGpaForGrade(aValue);
        bValue = getGpaForGrade(bValue);
      }
    } else {
      aValue = a[key];
      bValue = b[key];
    }

    if (aValue === bValue) {
      return 0;
    }

    return aValue > bValue ? order : -order;
  });
});

function setSort(key: string) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
}
</script>

<template>
  <PageWrapper>
    <template #title>
      <h1>Total grades</h1>
    </template>
    <RoundedSection>
      <template v-if="coursesOverallGrades">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                class="cursor-pointer select-none"
                @click="setSort('course_id')"
                >ID
                <span v-if="sortKey === 'course_id'" class="text-xs">
                  {{ sortOrder === "asc" ? "▲" : "▼" }}
                </span></TableHead
              >
              <TableHead
                class="cursor-pointer select-none"
                @click="setSort('name')"
                >Course
                <span v-if="sortKey === 'name'" class="text-xs">
                  {{ sortOrder === "asc" ? "▲" : "▼" }}
                </span></TableHead
              >
              <TableHead
                class="cursor-pointer select-none"
                @click="setSort('grade')"
                >Grade
                <span v-if="sortKey === 'grade'" class="text-xs">
                  {{ sortOrder === "asc" ? "▲" : "▼" }}
                </span></TableHead
              >
              <TableHead
                class="cursor-pointer select-none text-right"
                @click="setSort('gpa')"
                >GPA
                <span v-if="sortKey === 'gpa'" class="text-xs">
                  {{ sortOrder === "asc" ? "▲" : "▼" }}
                </span></TableHead
              >
            </TableRow>
          </TableHeader>
          <TableBody>
            <template
              v-for="course in sortedOverallGrades"
              :key="course.course_id"
            >
              <TableRow>
                <TableCell> {{ course.course_id }} </TableCell>
                <TableCell>
                  <Link
                    :to="{
                      name: RouteName.Course,
                      params: { courseId: course.course_id },
                    }"
                    >{{ course.name }}
                  </Link>
                </TableCell>
                <TableCell>
                  {{
                    course.grades?.find(
                      (item) =>
                        item.itemtype === "course" && item.name === "Total",
                    )?.percentage ?? "-"
                  }}
                </TableCell>
                <TableCell class="text-right">
                  {{
                    getGpaForGrade(
                      course.grades?.find(
                        (item) =>
                          item.itemtype === "course" && item.name === "Total",
                      )?.percentage ?? 0,
                    )
                  }}
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </template>
    </RoundedSection>
  </PageWrapper>
</template>
