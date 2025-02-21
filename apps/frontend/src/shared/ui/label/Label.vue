<script setup lang="ts">
import { Label, type LabelProps } from "reka-ui";
import { cn } from "@/shared/ui/utils";

const props = defineProps<LabelProps & { class?: string }>();
</script>

<template>
  <Label
    v-bind="props"
    :class="
      cn(
        'block text-left text-sm font-medium tracking-tight text-foreground',
        props.class,
      )
    "
  >
    <slot />
  </Label>
</template>
