<script setup lang="ts">
import { AlertDialogAction, type AlertDialogActionProps } from "radix-vue";
import { cn } from "@/shared/utils";
import { buttonVariants } from "@/shared/ui/button";

const props = defineProps<AlertDialogActionProps>();
</script>

<template>
  <AlertDialogAction
    v-bind="props"
    :class="cn(buttonVariants(), $attrs.class ?? '')"
  >
    <slot />
  </AlertDialogAction>
</template>
