<script setup lang="ts">
import { onMounted, watch, watchEffect } from "vue";
import { storeToRefs } from "pinia";
import { useQuery } from "@tanstack/vue-query";
import type { IUser } from "@remoodle/types";
import { RouterView, useRoute, useRouter } from "vue-router";
import { useUrlSearchParams } from "@vueuse/core";
import { ConfigProvider } from "radix-vue";
import { useAnalytics } from "@/shared/lib/use-analytics";
import { useLogout } from "@/shared/lib/use-logout";
import { useUserStore } from "@/shared/stores/user";
import { useAppStore } from "@/shared/stores/app";
import { RouteName } from "@/shared/lib/routes";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import Toaster from "@/shared/ui/toast/Toaster.vue";

const route = useRoute();
const router = useRouter();

const appStore = useAppStore();
const { theme } = storeToRefs(appStore);

watchEffect(() => {
  document.documentElement.setAttribute("data-theme", theme.value);
});

const userStore = useUserStore();
const { authorized, user } = storeToRefs(userStore);

const { posthog } = useAnalytics();

const { data, error } = useQuery({
  queryKey: ["private", "check"],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.user.check.$get(
        {},
        { headers: getAuthHeaders(userStore.accessToken) },
      ),
    ),
  enabled: authorized,
});

watchEffect(() => {
  if (data.value) {
    user.value = data.value;

    posthog.identify(user.value._id, {
      name: user.value.name,
      username: user.value.username,
      handle: user.value.handle,
      health: user.value.health,
    });
  }
});

const { logout } = useLogout();

watchEffect(() => {
  if (error.value?.status === 401) {
    logout();
  }
});

watch(authorized, async (now, was) => {
  if (was && !now && route.meta.auth === "required") {
    await router.push({
      name: RouteName.Login,
      query: { next: route.fullPath },
    });
  }

  if (!was && now && route.meta.auth === "forbidden") {
    const redirectTo = route.query.next as string;

    if (redirectTo) {
      await router.push(redirectTo);
      return;
    }

    await router.push({ name: RouteName.Home });
  }
});

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
});
</script>

<template>
  <ConfigProvider>
    <div class="flex h-[100svh] flex-col">
      <RouterView />
    </div>
    <Toaster />
  </ConfigProvider>
</template>
