<script setup lang="ts">
import { Sun, Moon } from "lucide-vue-next";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/stores/app";

const appStore = useAppStore();

const toggleTheme = () => {
  appStore.toggleTheme();
};
</script>

<template>
  <slot :toggle-theme="toggleTheme" :theme="appStore.theme">
    <Button
      variant="outline"
      size="icon"
      class="h-7 w-7"
      :aria-label="`Switch to ${appStore.theme === 'light' ? 'dark' : 'light'} theme`"
      :title="`Switch to ${appStore.theme === 'light' ? 'dark' : 'light'} theme`"
      @click="toggleTheme"
    >
      <Sun v-if="appStore.theme === 'light'" class="h-4 w-4" />
      <Moon v-else class="h-4 w-4" />
    </Button>
  </slot>
</template>
