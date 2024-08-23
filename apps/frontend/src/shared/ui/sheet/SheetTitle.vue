<script setup lang="ts">
import { DialogTitle, type DialogTitleProps } from "radix-vue";
import { cn } from "@/shared/lib/helpers";

const props = defineProps<DialogTitleProps & { class?: string }>();
</script>

<template>
  <DialogTitle
    :class="cn('text-lg font-semibold text-foreground', props.class)"
    v-bind="props"
  >
    <slot />
  </DialogTitle>
</template>
