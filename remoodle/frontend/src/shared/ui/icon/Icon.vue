<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { icons } from "./lib";

type IconName = keyof typeof icons;

defineProps<{
  name: IconName;
}>();
</script>

<template>
  <Icon :icon="icons[name]" v-bind="$attrs" />
</template>
