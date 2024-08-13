<script setup lang="ts">
import { PageWrapper } from "@/entities/page";
import TotalsTable from "./ui/TotalsTable.vue";
</script>

<template>
  <PageWrapper>
    <template #title>
      <h1>Total grades by courses</h1>
    </template>
    <template #island>
      <TotalsTable />
    </template>
  </PageWrapper>
</template>
