<script setup lang="ts">
import { watch } from "vue";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/shared/stores/user";
import { useAppStore } from "@/shared/stores/app";
import { RouteName } from "@/shared/types";
import Toaster from "@/shared/ui/toast/Toaster.vue";

const appStore = useAppStore();

watch(
  () => appStore.theme,
  (value) => {
    document.documentElement.setAttribute("data-theme", value);
  },
  { immediate: true },
);

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();

watch(
  () => userStore.authorized,
  (now, was) => {
    if (was && !now && route.meta.auth === "required") {
      router.push({ name: RouteName.Login, query: { next: route.fullPath } });
    }

    if (!was && now && route.meta.auth === "forbidden") {
      const redirectTo = route.query.next as string;

      if (redirectTo) {
        return router.push(redirectTo);
      }

      router.push({ name: RouteName.Home });
    }
  },
);
</script>

<template>
  <div class="flex h-[100svh] flex-col">
    <RouterView />
  </div>
  <Toaster />
</template>
