<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "@/shared/stores/user";
import { RoundedSection, PageWrapper } from "@/entities/page";
import type { UserSettings } from "@remoodle/types";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess } from "@/shared/lib/helpers";
import { useToast } from "@/shared/ui/toast";
import { Picture } from "@/shared/ui/picture";
import { RouteName } from "@/shared/types";
import AccountSidebar from "./ui/AccountSidebar.vue";
import AccountProfilePage from "./AccountProfile.vue";
import AccountNotificationsPage from "./AccountNotifications.vue";

const userStore = useUserStore();

const route = useRoute();

const { toast } = useToast();

const settings = ref<{
  moodleId: number;
  name: string;
  handle: string;
  hasPassword: boolean;
  telegramId?: number;
}>();

const { run: loadSettings, loading: loadingSettings } = createAsyncProcess(
  async () => {
    const [data, error] = await request((client) =>
      client.v1.user.settings.$get(
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
      <template v-if="settings">
        <div class="flex items-center gap-4">
          <Picture :name="settings.moodleId" :size="56" />
          <div class="flex flex-col">
            {{ settings.name }}
            <span class="text-sm text-muted-foreground">
              {{ settings.handle }}
            </span>
          </div>
        </div>
      </template>
    </template>
    <RoundedSection>
      <div
        class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0"
      >
        <aside class="-mx-4 lg:w-1/5">
          <AccountSidebar />
        </aside>
        <div class="flex-1">
          <div class="space-y-6" v-if="settings">
            <template v-if="route.name === RouteName.AccountProfile">
              <AccountProfilePage :settings="settings" />
            </template>
            <template v-else-if="route.name === RouteName.AccountNotifications">
              <AccountNotificationsPage :settings="settings" />
            </template>
          </div>
        </div>
      </div>
    </RoundedSection>
  </PageWrapper>
</template>
