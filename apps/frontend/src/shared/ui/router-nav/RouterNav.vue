<script setup lang="ts">
import { ref } from "vue";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";

withDefaults(
  defineProps<{
    bordered?: boolean;
    padding?: boolean;
    rounded?: boolean;
    exactActive?: boolean;
    shadow?: boolean;
  }>(),
  {
    bordered: true,
    padding: false,
    rounded: false,
    exactActive: true,
    shadow: false,
  },
);

const elList = ref<HTMLElement | null>(null);

defineExpose({ elList });
</script>

<template>
  <!-- <ScrollArea class="whitespace-nowrap"> -->
  <nav
    class="flex flex-row flex-nowrap gap-2 overflow-x-auto overflow-y-hidden rounded-2xl bg-background"
    style="-webkit-overflow-scrolling: touch"
    :class="[[padding && 'px-6'], [shadow && 'shadow']]"
  >
    <div
      v-bind="$attrs"
      ref="elList"
      class="flex h-14 w-full flex-row gap-x-3 [&>*]:relative [&>*]:flex [&>*]:h-full [&>*]:flex-shrink-0 [&>*]:items-center [&>*]:gap-1 [&>*]:px-2 [&>*]:no-underline [&>*]:before:absolute [&>*]:before:left-0 [&>*]:before:top-[95%] [&>*]:before:z-[0] [&>*]:before:hidden [&>*]:before:h-1 [&>*]:before:w-full [&>*]:before:bg-primary [&>*]:before:content-['']"
      :class="[
        bordered && 'border-b',
        [rounded ? '[&>*]:before:rounded' : '[&>*]:before:rounded-t-full'],
        exactActive
          ? '[&>.router-link-exact-active]:before:block'
          : '[&>.router-link-active]:before:block',
      ]"
    >
      <slot></slot>
    </div>
  </nav>
  <!-- <ScrollBar orientation="horizontal" />
  </ScrollArea> -->
</template>
