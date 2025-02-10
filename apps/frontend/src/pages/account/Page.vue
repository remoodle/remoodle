<script setup lang="ts">
import { ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useRoute } from "vue-router";
import { useUserStore } from "@/shared/stores/user";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { requestUnwrap, getAuthHeaders } from "@/shared/lib/hc";
import { useToast } from "@/shared/ui/toast";
import { Avatar } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import { RouteName } from "@/shared/lib/routes";
import AccountSidebar from "./ui/AccountSidebar.vue";
import AccountProfilePage from "./AccountProfile.vue";
import AccountNotificationsPage from "./AccountNotifications.vue";

const userStore = useUserStore();

const route = useRoute();

const { toast } = useToast();

const {
  isPending,
  isError,
  data: account,
  error,
  refetch,
} = useQuery({
  queryKey: ["account", userStore.user],
  queryFn: async () =>
    await requestUnwrap((client) =>
      client.v2.user.settings.$get({}, { headers: getAuthHeaders() }),
    ),
});
</script>

<template>
  <PageWrapper v-if="userStore.user && userStore.authorized">
    <template #title>
      <div class="flex items-center gap-4">
        <Avatar :name="userStore.user.handle" :size="56" />
        <div class="flex flex-col">
          {{ userStore.user.name }}
          <span class="text-sm text-muted-foreground">
            {{ userStore.user.handle }}
          </span>
        </div>
      </div>
    </template>
    <RoundedSection>
      <div
        class="flex flex-col space-x-2 space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0"
      >
        <aside class="lg:w-1/5">
          <AccountSidebar />
        </aside>
        <div class="flex-1">
          <template v-if="isPending">
            <div class="flex flex-col gap-4">
              <Skeleton class="h-12" />
              <Skeleton class="h-6 w-1/2" />
              <Skeleton class="h-6" />
            </div>
            <div class="py-6"></div>
            <div class="flex flex-col gap-4">
              <Skeleton class="h-12" />
              <Skeleton class="h-6 w-1/3" />
              <Skeleton class="h-6" />
            </div>
            <div class="py-6"></div>
            <div class="flex flex-col gap-4">
              <Skeleton class="h-6 w-1/4" />
              <Skeleton class="h-6" />
              <Skeleton class="h-12" />
            </div>
          </template>
          <template v-else-if="account">
            <div class="space-y-6">
              <template v-if="route.name === RouteName.AccountProfile">
                <AccountProfilePage :account />
              </template>
              <template
                v-else-if="route.name === RouteName.AccountNotifications"
              >
                <AccountNotificationsPage :account />
              </template>
            </div>
          </template>
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
