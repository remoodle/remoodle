<script lang="ts" setup>
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import GroupSelect from "./ui/GroupSelect.vue";
import ScheduleSettings from "./ui/ScheduleSettings.vue";
import ExportToIcal from "./ui/ExportToIcal.vue";
import { useSchedule } from "./composables/useSchedule";

import dayjs from "dayjs";
import { useAppStore } from "@/shared/stores/app";

const { groupSchedule, allGroups, convertToDateTime, groupCourses } =
  useSchedule();
const { group } = useAppStore();

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
      <div class="w-100 flex gap-4">
        <h1>Schedule</h1>
        <GroupSelect :all-groups />
      </div>
    </template>
    <RoundedSection>
      <Calendar
        :events="groupSchedule"
        :min-date="convertToDateTime(minDate)"
        :max-date="convertToDateTime(maxDate)"
      />
      <div class="my-4 flex justify-between gap-2">
        <ScheduleSettings :group="group" :courses="groupCourses" />
        <ExportToIcal />
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
