<script lang="ts" setup>
import { computed } from "vue";
import { RouterLink, type RouteLocationRaw } from "vue-router";

const props = withDefaults(
  defineProps<{
    to: RouteLocationRaw;
    hover?: boolean;
    target?: string;
    underline?: boolean;
    decreaseOpacity?: boolean;
    forceExactActive?: boolean;
    multiline?: boolean;
  }>(),
  {
    hover: false,
    target: undefined,
    underline: false,
    decreaseOpacity: false,
    forceExactActive: false,
    multiline: false,
  },
);

const isExternal = computed(
  () => typeof props.to == "string" && !props.to.startsWith("/"),
);

const classes = computed(() => [
  [props.underline ? "underline underline-offset-4" : "no-underline"],
  { "link-hover hover:text-primary": props.hover },
  { "hover:opacity-80": props.decreaseOpacity },
  { "min-w-max": isExternal.value && !props.multiline },
  { "router-link-exact-active": props.forceExactActive },
]);
</script>

<template>
  <a
    v-if="typeof to == 'string' && isExternal"
    :href="to"
    :target="target ?? '_blank'"
    :class="classes"
    v-bind="$attrs"
  >
    <slot />
  </a>
  <RouterLink v-else :to="to" :class="classes" :target="target" v-bind="$attrs">
    <slot />
  </RouterLink>
</template>
