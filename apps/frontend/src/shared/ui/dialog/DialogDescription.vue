<script setup lang="ts">
import { DialogDescription, type DialogDescriptionProps } from "radix-vue";
import { cn } from "@/shared/ui/utils";

const props = defineProps<DialogDescriptionProps & { class?: string }>();
</script>

<template>
  <DialogDescription
    v-bind="props"
    :class="cn('text-sm text-muted-foreground', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
