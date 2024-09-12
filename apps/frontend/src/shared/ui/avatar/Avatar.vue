<script setup lang="ts">
import Avatar from "vue-boring-avatars";

withDefaults(
  defineProps<{
    name: string | number;
    indicator?: boolean;
    indicatorStyles?: string;
    size?: number;
  }>(),
  {
    name: "",
    indicator: false,
    indicatorStyles: "bg-green-500",
    size: 22,
  },
);
</script>

<template>
  <div
    tabindex="0"
    class="focus-visible:ring-primaryDark relative flex cursor-pointer items-center justify-center rounded-full focus:outline-none focus-visible:ring"
  >
    <Avatar
      :size="size"
      :name="`${name}`"
      :square="false"
      :colors="['#FFAD08', '#EDD75A', '#73B06F', '#0C8F8F', '#405059']"
      variant="beam"
    />
    <span
      v-if="indicator"
      class="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-primary"
      :class="indicatorStyles"
    ></span>
  </div>
</template>
