<script setup lang="ts">
import { computed } from "vue";
import { vDompurify } from "./lib";
import linkifyHtml from "linkify-html";

const props = withDefaults(
  defineProps<{
    msg: string;
    linkify?: boolean;
    wrap?: boolean;
  }>(),
  {
    msg: "",
    linkify: true,
    wrap: true,
  },
);

const formattedText = computed(() => {
  const tidyText = props.msg.replace(/(\r\n|\r|\n){2,}/g, "$1\n");

  return props.linkify ? linkifyHtml(tidyText) : tidyText;
});
</script>

<template>
  <!-- <p
    v-bind="$attrs"
    v-dompurify="formattedText"
    :class="{ 'whitespace-wrap break-words': wrap }"
  /> -->
  <div
    v-bind="$attrs"
    v-dompurify="formattedText"
    v-html="formattedText"
    :class="{
      'whitespace-wrap break-words': wrap,
    }"
  ></div>
</template>
