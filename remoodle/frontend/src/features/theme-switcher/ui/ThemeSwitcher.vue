<script setup lang="ts">
import { useAppStore } from "@/shared/stores/app";
import { Icon } from "@/shared/ui/icon";
import { Button } from "@/shared/ui/button";

const appStore = useAppStore();

const toggleTheme = () => {
  appStore.toggleTheme();
};
</script>

<template>
  <slot :toggle-theme="toggleTheme" :theme="appStore.theme">
    <Button variant="secondary" size="icon" @click="toggleTheme">
      <Icon
        class="h-6 w-6"
        :name="appStore.theme === 'light' ? 'sun' : 'moon'"
      />
    </Button>
  </slot>
</template>
