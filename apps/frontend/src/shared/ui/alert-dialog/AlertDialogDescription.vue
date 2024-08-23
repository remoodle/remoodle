<script setup lang="ts">
import {
  AlertDialogDescription,
  type AlertDialogDescriptionProps,
} from "radix-vue";
import { cn } from "@/shared/lib/helpers";

const props = defineProps<AlertDialogDescriptionProps & { class?: string }>();
</script>

<template>
  <AlertDialogDescription
    :class="cn('text-sm text-muted-foreground', props.class)"
    :as-child="props.asChild"
  >
    <slot />
  </AlertDialogDescription>
</template>
