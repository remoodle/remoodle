<script setup lang="ts">
import { ToastDescription, type ToastDescriptionProps } from "reka-ui";
import { cn } from "@/shared/ui/utils";

const props = defineProps<ToastDescriptionProps & { class?: string }>();
</script>

<template>
  <ToastDescription
    :class="cn('text-sm opacity-90', props.class)"
    v-bind="props"
  >
    <slot />
  </ToastDescription>
</template>
