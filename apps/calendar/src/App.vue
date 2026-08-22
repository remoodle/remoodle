<script setup lang="ts">
import { watchEffect } from "vue";
import { RouterView } from "vue-router";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

watchEffect(() => {
  document.documentElement.setAttribute("data-theme", appStore.theme);
});
</script>

<template>
  <RouterView />
</template>
