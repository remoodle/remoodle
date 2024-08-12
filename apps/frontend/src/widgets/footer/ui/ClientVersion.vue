<script setup lang="ts">
import { Link } from "@/shared/ui/link";
import { isDefined } from "@/shared/utils";
import { getRepoURL, getBuildInfo } from "../lib";

const buildInfo = getBuildInfo() ?? {
  version: "0",
};
</script>

<template>
  <span v-if="isDefined(buildInfo)"> v{{ buildInfo.version }} </span>
</template>
