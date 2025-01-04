<script lang="ts" setup>
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import GroupSelect from "./ui/GroupSelect.vue";
</script>
<template>
  <PageWrapper>
    <template #title>
      <h1>Schedule</h1>
      <GroupSelect />
    </template>
    <RoundedSection>
      <Calendar :events="[]" />
    </RoundedSection>
  </PageWrapper>
</template>
