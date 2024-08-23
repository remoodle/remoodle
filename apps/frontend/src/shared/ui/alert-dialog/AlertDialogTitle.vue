<script setup lang="ts">
import { AlertDialogTitle, type AlertDialogTitleProps } from "radix-vue";
import { cn } from "@/shared/lib/helpers";

const props = defineProps<AlertDialogTitleProps & { class?: string }>();
</script>

<template>
  <AlertDialogTitle
    :as-child="props.asChild"
    :class="cn('text-lg font-semibold text-foreground', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>
