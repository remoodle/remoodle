<script setup lang="ts">
import { onMounted, watch } from "vue";
import type { IUser } from "@remoodle/types";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useUrlSearchParams } from "@vueuse/core";
import { ConfigProvider } from "radix-vue";
import { useAnalytics } from "@/shared/lib/use-analytics";
import { useUserStore } from "@/shared/stores/user";
import { useAppStore } from "@/shared/stores/app";
import { RouteName } from "@/shared/lib/routes";
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

const { posthog } = useAnalytics();

onMounted(async () => {
  const params = useUrlSearchParams("history");

  const usr = params.usr as string | undefined;

  if (usr) {
    const data = atob(usr);

    const resp = JSON.parse(data) as {
      user: IUser;
      accessToken: string;
      refreshToken: string;
    };

    if (!resp.user) {
      return;
    }

    userStore.login(resp.accessToken, resp.refreshToken, resp.user);
  }

  if (userStore.authorized && userStore.user) {
    posthog.identify(userStore.user.handle, {
      name: userStore.user.name,
      username: userStore.user.username,
      health: userStore.user.health,
    });
  }
});

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
  <ConfigProvider :scroll-body="false">
    <div class="flex h-[100svh] flex-col">
      <RouterView />
    </div>
    <Toaster />
  </ConfigProvider>
</template>
