<script setup lang="ts">
import { ref } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { Icon } from "@/shared/ui/icon";
import { Link } from "@/shared/ui/link";

withDefaults(
  defineProps<{
    back?: RouteLocationRaw;
    stickyHeader?: boolean;
    dense?: boolean;
    wrapHeader?: boolean;
  }>(),
  {
    back: undefined,
    gradient: undefined,
    stickyHeader: false,
    dense: false,
    wrapHeader: false,
  },
);

const elHeaderContainer = ref();

const elBanner = ref();
</script>

<template>
  <div class="-my-10 rounded-b-[45px]">
    <main class="container" :class="[dense ? 'mb-4 pt-4' : 'mb-6 pt-6']">
      <div ref="elBanner">
        <slot name="banner"></slot>
      </div>
      <div
        class="py-3"
        :class="{
          hidden: elBanner?.childElementCount === 0,
        }"
      ></div>

      <slot name="header-content">
        <div class="flex flex-col gap-8">
          <div
            class="flex items-center justify-between"
            :class="{ 'flex-wrap gap-4': wrapHeader }"
          >
            <div class="flex items-center gap-3">
              <Link v-if="back" :to="back">
                <Icon name="arrow_left" class="h-9 w-auto" />
              </Link>
              <h1
                data-testid="page-title"
                class="break-all text-2xl font-medium md:text-3xl"
              >
                <slot name="title"></slot>
              </h1>
            </div>
            <slot name="actions"></slot>
          </div>
        </div>
      </slot>
    </main>
    <div
      ref="elHeaderContainer"
      class="container mb-6"
      :class="{
        hidden: elHeaderContainer?.childElementCount === 0,
        'sticky top-0 z-[2]': stickyHeader,
      }"
    >
      <div v-if="$slots.header" class="flex flex-col gap-6 lg:flex-row">
        <div
          class="rounded-y w-full rounded-3xl p-6 shadow-sm"
          :class="{ 'border-base-300 border': stickyHeader }"
        >
          <slot name="header" />
        </div>
        <div
          v-if="$slots['header-activity']"
          class="rounded-y w-full rounded-3xl p-6 shadow-sm lg:w-1/4"
        >
          <slot name="header-activity" />
        </div>
      </div>
      <div v-if="$slots.island">
        <slot name="island" />
      </div>
    </div>
    <slot />
  </div>
</template>
