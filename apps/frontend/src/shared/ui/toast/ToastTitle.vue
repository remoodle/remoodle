<script setup lang="ts">
import { ToastTitle, type ToastTitleProps } from "reka-ui";
import { cn } from "@/shared/ui/utils";

const props = defineProps<ToastTitleProps & { class?: string }>();
</script>

<template>
  <ToastTitle v-bind="props" :class="cn('text-sm font-semibold', props.class)">
    <slot />
  </ToastTitle>
</template>
