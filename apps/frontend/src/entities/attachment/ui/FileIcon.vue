<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { Icon, fileIcons, type FileIconName } from "@/shared/ui/icon";
import { cn } from "@/shared/ui/utils";

const props = defineProps<{
  mimetype: string;
  class?: HTMLAttributes["class"];
}>();
</script>

<template>
  <Icon
    :name="mimetype in fileIcons ? (mimetype as FileIconName) : 'file'"
    :class="cn('h-auto w-6 flex-none', props.class)"
  />
</template>
