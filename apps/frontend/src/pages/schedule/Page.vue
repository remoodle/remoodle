<script lang="ts" setup>
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import GroupSelect from "./ui/GroupSelect.vue";
import { useSchedule } from "./composables/useSchedule";
import { useAppStore } from "@/shared/stores/app";

import dayjs from "dayjs";

const appStore = useAppStore();

const { groupSchedule, allGroups, convertToDateTime } = useSchedule(
  appStore.group || "SE-2203",
);

const getGroups = (allGroups: string[]) => {
  const groups: Record<string, string[]> = {};
  allGroups.forEach((group) => {
    const course = group.split("-")[0];
    if (!groups[course]) {
      groups[course] = [];
    }
    groups[course].push(group);
  });
  return groups;
};

const minDate = dayjs()
  .weekday(0)
  .hour(0)
  .minute(0)
  .second(0)
  .millisecond(0)
  .toDate();

const maxDate = dayjs()
  .weekday(6)
  .hour(23)
  .minute(59)
  .second(59)
  .millisecond(999)
  .toDate();
</script>
<template>
  <PageWrapper>
    <template #title>
      <h1>Schedule</h1>
      <GroupSelect :groups="getGroups(allGroups)" />
    </template>
    <RoundedSection>
      <Calendar
        :events="groupSchedule"
        :min-date="convertToDateTime(minDate)"
        :max-date="convertToDateTime(maxDate)"
      />
    </RoundedSection>
  </PageWrapper>
</template>
