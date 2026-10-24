<script setup lang="ts">
// Static preview. Colors mirror the calendars configured in Schedule.vue.
const kinds = {
  lecture:
    "border-[#2563EB] bg-[#DBEAFE] text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E3A5F] dark:text-[#EFF6FF]",
  practice:
    "border-[#F44336] bg-[#FFCDD2] text-[#B71C1C] dark:border-[#EF9A9A] dark:bg-[#4A2020] dark:text-[#FFEBEE]",
  deadline:
    "border-[#4CAF50] bg-[#C8E6C9] text-[#1B5E20] dark:border-[#A5D6A7] dark:bg-[#1C3A28] dark:text-[#E8F5E9]",
};

const days = [
  { name: "Mon", date: 19 },
  { name: "Tue", date: 20 },
  { name: "Wed", date: 21 },
  { name: "Thu", date: 22 },
  { name: "Fri", date: 23 },
];

const hours = [9, 10, 11, 12, 13, 14];

const classes = [
  {
    day: 1,
    from: 9,
    to: 11,
    time: "09:00",
    title: "Algorithms",
    detail: "C1.2.248",
    kind: "lecture",
  },
  {
    day: 2,
    from: 11,
    to: 12,
    time: "11:00",
    title: "Calculus",
    detail: "C1.3.361",
    kind: "practice",
  },
  {
    day: 3,
    from: 9,
    to: 11,
    time: "09:00",
    title: "Algorithms",
    detail: "Online",
    kind: "lecture",
  },
  {
    day: 3,
    from: 13,
    to: 15,
    time: "13:00",
    title: "Databases",
    detail: "C1.1.239",
    kind: "practice",
  },
  {
    day: 4,
    from: 10,
    to: 12,
    time: "10:00",
    title: "English",
    detail: "C1.3.255",
    kind: "practice",
  },
  {
    day: 5,
    from: 12,
    to: 14,
    time: "12:00",
    title: "Databases",
    detail: "Main hall",
    kind: "lecture",
  },
] as const;
</script>

<template>
  <figure
    class="m-0 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
    aria-label="Example week with classes from My DU and a Moodle deadline"
  >
    <div aria-hidden="true">
      <div class="flex items-baseline justify-between border-b px-4 py-3">
        <span class="text-sm font-medium">October 19–23</span>
        <span class="text-xs text-muted-foreground">Week 8</span>
      </div>

      <div
        class="grid grid-cols-[2rem_repeat(5,minmax(0,1fr))] text-xs sm:grid-cols-[2.75rem_repeat(5,minmax(0,1fr))]"
      >
        <div />
        <div v-for="day in days" :key="day.name" class="truncate border-l px-1.5 py-2 sm:px-2">
          <span class="text-muted-foreground">{{ day.name }}</span>
          <span class="ml-1 font-medium">{{ day.date }}</span>
        </div>

        <div />
        <div v-for="day in days" :key="day.name" class="min-h-8 border-l px-1 pb-1">
          <div
            v-if="day.date === 22"
            :class="kinds.deadline"
            class="truncate rounded-sm border-l-2 px-1.5 py-1 text-[11px] font-medium"
          >
            <span class="max-sm:hidden">23:59 · </span>Lab 4 due
          </div>
        </div>
      </div>

      <div
        class="grid grid-cols-[2rem_repeat(5,minmax(0,1fr))] border-t sm:grid-cols-[2.75rem_repeat(5,minmax(0,1fr))]"
        :style="{ gridTemplateRows: `repeat(${hours.length}, 3rem)` }"
      >
        <template v-for="(hour, row) in hours" :key="hour">
          <div
            class="pr-1.5 pt-1 text-right text-[10px] text-muted-foreground tabular-nums sm:text-[11px]"
            :style="{ gridRow: row + 1, gridColumn: 1 }"
          >
            {{ String(hour).padStart(2, "0") }}:00
          </div>
          <div
            v-for="(day, column) in days"
            :key="day.name"
            class="border-l"
            :class="row > 0 && 'border-t'"
            :style="{ gridRow: row + 1, gridColumn: `${column + 2} / span 1` }"
          />
        </template>

        <div
          v-for="lesson in classes"
          :key="`${lesson.day}-${lesson.from}`"
          :class="kinds[lesson.kind]"
          class="z-10 m-0.5 flex flex-col gap-0.5 overflow-hidden rounded-sm border-l-2 px-1.5 py-1 text-[11px] leading-tight"
          :style="{
            gridColumn: `${lesson.day + 1} / span 1`,
            gridRow: `${lesson.from - hours[0]! + 1} / ${lesson.to - hours[0]! + 1}`,
          }"
        >
          <span class="tabular-nums opacity-80">{{ lesson.time }}</span>
          <span class="truncate font-medium">{{ lesson.title }}</span>
          <span v-if="lesson.to - lesson.from > 1" class="truncate opacity-80">{{
            lesson.detail
          }}</span>
        </div>
      </div>
    </div>
  </figure>
</template>
