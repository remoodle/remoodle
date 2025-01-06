<script lang="ts" setup>
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import GroupSelect from "./ui/GroupSelect.vue";
import { useSchedule } from "./composables/useSchedule";
import { useAppStore } from "@/shared/stores/app";

const appStore = useAppStore();

const { groupSchedule, allGroups, convertToDateTime, getTargetDateByDay } =
  useSchedule(appStore.group || "SE-2203");

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
        :min-date="convertToDateTime(getTargetDateByDay('Monday 00:00'))"
        :max-date="convertToDateTime(getTargetDateByDay('Saturday 23:59'))"
      />
    </RoundedSection>
  </PageWrapper>
</template>
