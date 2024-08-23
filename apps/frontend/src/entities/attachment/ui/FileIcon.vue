<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/shared/lib/helpers";
import { Icon, fileIcons, type FileIconName } from "@/shared/ui/icon";

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
