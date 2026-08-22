<script lang="ts" setup>
import type { RangeCalendarHeadingProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { RangeCalendarHeading, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";

const props = defineProps<RangeCalendarHeadingProps & { class?: HTMLAttributes["class"] }>();

defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: { headingValue: string }) => any;
}>();

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RangeCalendarHeading
    v-slot="{ headingValue }"
    data-slot="range-calendar-heading"
    :class="cn('text-sm font-medium', props.class)"
    v-bind="forwardedProps"
  >
    <slot :heading-value>
      {{ headingValue }}
    </slot>
  </RangeCalendarHeading>
</template>
