<script lang="ts" setup>
import { ref } from "vue";
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import GroupSelect from "./ui/GroupSelect.vue";
import { useSchedule } from "./composables/useSchedule";
import { useAppStore } from "@/shared/stores/app";

const appStore = useAppStore();
// const { groupSchedule } = useSchedule(appStore.group || "SE-2203");
const { groupSchedule } = useSchedule("SE-2203");
console.log(groupSchedule.value);
// const groupSchedule = ref([
//   { id: 1, start: "2025-01-06 12:00", end: "2025-01-06 14:00", title: "Lunch" },
// ]);
</script>
<template>
  <PageWrapper>
    <template #title>
      <h1>Schedule</h1>
      <GroupSelect />
    </template>
    <RoundedSection>
      <Calendar :events="groupSchedule" />
    </RoundedSection>
  </PageWrapper>
</template>
