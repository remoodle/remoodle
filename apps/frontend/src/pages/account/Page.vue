<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/shared/stores/user";
import { RoundedSection, PageWrapper } from "@/entities/page";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess } from "@/shared/lib/helpers";
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

const settings = ref<{
  name: string;
  handle: string;
  moodleId: number;
  telegramId?: number;
  hasPassword: boolean;
  notifications: {
    telegram: {
      enabled: boolean;
      gradeUpdates: boolean;
      deadlineReminders: boolean;
    };
    deadlineThresholds: string[];
  };
}>();

const { run: loadSettings, loading: loadingSettings } = createAsyncProcess(
  async () => {
    const [data, error] = await request((client) =>
      client.v2.user.settings.$get(
        {},
        {
          headers: getAuthHeaders(),
        },
      ),
    );

    if (error) {
      toast({
        title: error.message,
      });
      throw error;
    }

    settings.value = data;
  },
);

onMounted(async () => {
  await loadSettings();
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
          <template v-if="loadingSettings">
            <div class="flex flex-col gap-4">
              <Skeleton class="h-12" />
              <Skeleton class="h-6" />
              <Skeleton class="h-6" />
            </div>
          </template>
          <template v-else-if="settings">
            <div class="space-y-6">
              <template v-if="route.name === RouteName.AccountProfile">
                <AccountProfilePage :settings="settings" />
              </template>
              <template
                v-else-if="route.name === RouteName.AccountNotifications"
              >
                <AccountNotificationsPage :settings="settings" />
              </template>
            </div>
          </template>
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
