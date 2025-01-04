<script lang="ts" setup>
import { RoundedSection, PageWrapper } from "@/entities/page";
import Calendar from "./ui/Calendar.vue";
import "@schedule-x/theme-default/dist/index.css";
</script>
<template>
  <PageWrapper>
    <template #title>
      <h1>Schedule</h1>
    </template>
    <RoundedSection>
      <Calendar :events="[]" :group="'SE-2203'" />
    </RoundedSection>
  </PageWrapper>
</template>
