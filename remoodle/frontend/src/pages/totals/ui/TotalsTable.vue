<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/shared/stores/user";
import {
  RouteName,
  CourseTotalGradeItem,
  MoodleCourseItem,
} from "@/shared/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Link } from "@/shared/ui/link";

const userStore = useUserStore();
const { user, token } = storeToRefs(userStore);

const totalGradesData = ref<CourseTotalGradeItem[]>();
const moodleCourses = ref<MoodleCourseItem[]>();

const fetchTotalGrades = async (moodleToken: string, moodleId: number) => {
  let response = await fetch(
    `https://moodle.astanait.edu.kz/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=gradereport_overview_get_course_grades&moodlewsrestformat=json`,
  );

  if (!response.ok || response.status !== 200) {
    throw new Error("Failed to fetch total grades");
  }

  totalGradesData.value = await response.json();

  response = await fetch(
    `https://moodle.astanait.edu.kz/webservice/rest/server.php?wstoken=${moodleToken}&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json&userid=${moodleId}`,
  );

  if (!response.ok || response.status !== 200) {
    throw new Error("Failed to fetch total grades");
  }

  moodleCourses.value = await response.json();
};

const getGpaByGrade = (grade: number) => {
  grade = Math.floor(grade / 5) * 5;

  const grades: { [key: number]: number } = {
    100: 4.0,
    95: 4.0,
    90: 3.67,
    85: 3.33,
    80: 3.0,
    75: 2.67,
    70: 2.33,
    65: 2.0,
    60: 1.67,
    55: 1.33,
    50: 1.0,
  };

  return grades[grade] || 0;
};

fetchTotalGrades(token.value, user.value.moodle_id).then(() => {
  totalGradesData.value.grades = totalGradesData.value.grades.map(
    (totalGradeObj) => {
      const course = moodleCourses.value.find(
        (course) => course.id === totalGradeObj.courseid,
      );

      return {
        ...totalGradeObj,
        name: course?.displayname.split(" | ")[0],
        teacher: course?.displayname.split(" | ")[1],
        gpa: getGpaByGrade(totalGradeObj.grade),
      };
    },
  );
});

// Sorting begins here
const sortKey = ref<string>("courseid");
const sortOrder = ref<"asc" | "desc">("asc");

const sortedGrades = computed(() => {
  return [...totalGradesData.value.grades].sort((a, b) => {
    let result = 0;
    if (a[sortKey.value] > b[sortKey.value]) {
      result = 1;
    } else if (a[sortKey.value] < b[sortKey.value]) {
      result = -1;
    }

    return sortOrder.value === "asc" ? result : -result;
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
  <div class="p-3"></div>
  <Table v-if="totalGradesData">
    <TableHeader>
      <TableRow>
        <TableHead
          class="cursor-pointer select-none"
          @click="setSort('courseid')"
          >ID
          <span v-if="sortKey === 'courseid'" class="text-xs">
            {{ sortOrder === "asc" ? "▲" : "▼" }}
          </span></TableHead
        >
        <TableHead class="cursor-pointer select-none" @click="setSort('name')"
          >Course
          <span v-if="sortKey === 'name'" class="text-xs">
            {{ sortOrder === "asc" ? "▲" : "▼" }}
          </span></TableHead
        >
        <TableHead class="cursor-pointer select-none" @click="setSort('grade')"
          >Grade
          <span v-if="sortKey === 'grade'" class="text-xs">
            {{ sortOrder === "asc" ? "▲" : "▼" }}
          </span></TableHead
        >
        <TableHead class="cursor-pointer select-none" @click="setSort('gpa')"
          >GPA
          <span v-if="sortKey === 'gpa'" class="text-xs">
            {{ sortOrder === "asc" ? "▲" : "▼" }}
          </span></TableHead
        >
        <TableHead
          class="cursor-pointer select-none"
          @click="setSort('teacher')"
          >Teacher
          <span v-if="sortKey === 'teacher'" class="text-xs">
            {{ sortOrder === "asc" ? "▲" : "▼" }}
          </span></TableHead
        >
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="totalGrade in sortedGrades" :key="totalGrade.id">
        <TableCell>{{ totalGrade.courseid }}</TableCell>
        <TableCell>
          <Link
            :to="{
              name: RouteName.Course,
              params: { courseId: totalGrade.courseid },
            }"
            >{{ totalGrade.name }}
          </Link>
        </TableCell>
        <TableCell class="text-base">{{ totalGrade.grade }}</TableCell>
        <TableCell>{{ totalGrade.gpa }}</TableCell>
        <TableCell>{{ totalGrade.teacher }}</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <div v-else>No data</div>
</template>
