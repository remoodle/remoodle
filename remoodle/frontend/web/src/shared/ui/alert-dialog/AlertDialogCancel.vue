<script setup lang="ts">
import { AlertDialogCancel, type AlertDialogCancelProps } from "radix-vue";
import { cn } from "@/shared/utils";
import { buttonVariants } from "@/shared/ui/button";

const props = defineProps<AlertDialogCancelProps>();
</script>

<template>
  <AlertDialogCancel
    v-bind="props"
    :class="
      cn(
        buttonVariants({ variant: 'outline' }),
        'mt-2 sm:mt-0',
        $attrs.class ?? '',
      )
    "
  >
    <slot />
  </AlertDialogCancel>
</template>
