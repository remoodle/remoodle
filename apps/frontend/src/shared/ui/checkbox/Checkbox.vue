<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui";
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui";
import { Check } from "lucide-vue-next";
import { cn } from "@/shared/ui/utils";

const props = defineProps<CheckboxRootProps>();
const emits = defineEmits<CheckboxRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer h-4 w-4 shrink-0 rounded border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        $attrs.class ?? '',
      )
    "
  >
    <CheckboxIndicator
      class="flex h-full w-full items-center justify-center text-current"
    >
      <Check class="h-4 w-4" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
