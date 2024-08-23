<script setup lang="ts">
import { isDefined } from "@/shared/lib/helpers";

const getBuildInfo = () => {
  return __BUILD_INFO__;
};

const buildInfo = getBuildInfo() ?? {
  version: "0",
};
</script>

<template>
  <span v-if="isDefined(buildInfo)"> v{{ buildInfo.version }} </span>
</template>
