<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import AccountMenu from "@/components/AccountMenu.vue";
import GroupSelect from "@/components/GroupSelect.vue";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useGroupsQuery } from "@/lib/api";
import { useClearSession, useSessionQuery } from "@/lib/api/session";
import { useGenerateRemoodleToken, useSetPrimaryGroup, useUserProfileQuery } from "@/lib/api/user";
import { authClient } from "@/lib/auth-client";

const router = useRouter();
const { data: session } = useSessionQuery();
const { data: groups } = useGroupsQuery();
const { data: profile, refetch: refetchProfile } = useUserProfileQuery();

const setPrimaryGroup = useSetPrimaryGroup();
const generateToken = useGenerateRemoodleToken();
const clearSession = useClearSession();

const selectedGroup = ref("");
const generatedCode = ref<string | null>(null);
const copied = ref(false);

watch(
  [groups, profile],
  ([allGroups, userProfile]) => {
    if (selectedGroup.value) return;
    if (userProfile?.primaryGroup) {
      selectedGroup.value = userProfile.primaryGroup;
      return;
    }
    if (allGroups?.length) {
      selectedGroup.value = allGroups[0]!;
    }
  },
  { immediate: true },
);

const canSavePrimaryGroup = computed(
  () =>
    !!selectedGroup.value &&
    profile.value?.primaryGroup !== selectedGroup.value &&
    !!groups.value?.includes(selectedGroup.value),
);

const hasUnsavedPrimaryGroup = computed(() => canSavePrimaryGroup.value);
const currentPrimaryGroup = computed(() => profile.value?.primaryGroup || "not set");

async function savePrimaryGroup() {
  if (!canSavePrimaryGroup.value) return;
  await setPrimaryGroup.mutateAsync(selectedGroup.value);
  await refetchProfile();
}

async function generateCode() {
  const result = await generateToken.mutateAsync();
  generatedCode.value = result.token;
  copied.value = false;
}

async function copyCode() {
  if (!generatedCode.value) return;
  await navigator.clipboard.writeText(generatedCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

async function signOut() {
  await authClient.signOut();
  clearSession();
  await router.replace("/");
}
</script>

<template>
  <SidebarProvider
    :style="{ '--sidebar-width': '18rem' }"
    class="h-svh overflow-hidden bg-background"
  >
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader class="gap-4 p-3">
        <div class="flex items-center gap-2 px-1">
          <span class="text-sm font-semibold tracking-tight">ReMoodle Calendar</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Integration</SidebarGroupLabel>
          <SidebarGroupContent>
            <div class="space-y-3 px-1 text-sm text-muted-foreground">
              <p>Save a primary group first, then generate a short connection code.</p>
              <p>
                Send the code to
                <span class="font-mono text-foreground">@feathermoodbot</span>
                to reconnect your calendar.
              </p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter class="gap-3 p-3">
        <template v-if="session?.data">
          <AccountMenu
            :name="session.data.user.name"
            :email="session.data.user.email"
            @sign-out="signOut"
          />
        </template>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset class="overflow-hidden bg-background">
      <header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <div class="mx-2 h-4 w-px bg-border" />
        <span class="text-sm font-medium">Account</span>
        <div class="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" @click="router.push('/schedule')">
            <Icon icon="lucide:arrow-left" class="mr-2 h-4 w-4" />
            Back to schedule
          </Button>
        </div>
      </header>

      <div class="flex flex-1 flex-col">
        <div class="@container/main flex flex-1 flex-col gap-2">
          <section class="border-b px-5 py-5 sm:px-6">
            <div class="flex flex-col gap-2">
              <p class="text-lg font-semibold tracking-tight">Primary group</p>
              <p class="text-sm text-muted-foreground">
                Keep one saved group across the schedule, exports, and ReMoodle integration.
              </p>
            </div>

            <div class="mt-5 flex flex-col gap-4">
              <div class="max-w-sm">
                <GroupSelect v-model="selectedGroup" :all-groups="groups ?? []" />
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <Button
                  :disabled="!canSavePrimaryGroup || setPrimaryGroup.isPending.value"
                  @click="savePrimaryGroup"
                >
                  <Icon icon="lucide:save" class="mr-2 h-4 w-4" />
                  {{ setPrimaryGroup.isPending.value ? "Saving..." : "Save primary group" }}
                </Button>

                <p class="text-sm text-muted-foreground">
                  Current:
                  <span class="font-medium text-foreground">
                    {{ currentPrimaryGroup }}
                  </span>
                </p>
              </div>

              <div
                v-if="hasUnsavedPrimaryGroup"
                class="rounded-xl px-4 py-3 text-sm text-amber-950 dark:text-amber-100"
              >
                Save your primary group before reconnecting ReMoodle. Until then, the app will keep
                using
                <span class="font-medium">{{ profile?.primaryGroup || "no group" }}</span>
                instead of
                <span class="font-medium">{{ selectedGroup }}</span>
                .
              </div>
            </div>
          </section>

          <section class="px-5 py-5 sm:px-6">
            <div class="flex flex-col gap-2">
              <p class="text-lg font-semibold tracking-tight">Connect to ReMoodle</p>
              <p class="text-sm text-muted-foreground">
                Generate a short code and send it to
                <span class="font-mono text-foreground">@feathermoodbot</span>
                . Reconnect after changing your primary group.
              </p>
            </div>

            <div class="mt-5 flex flex-col gap-4">
              <template v-if="generatedCode">
                <div class="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                  <span class="font-mono text-xl font-semibold tracking-[0.2em]">
                    {{ generatedCode }}
                  </span>

                  <Button variant="ghost" size="icon" @click="copyCode">
                    <Icon :icon="copied ? 'lucide:check' : 'lucide:copy'" class="h-4 w-4" />
                  </Button>
                </div>

                <div class="flex flex-wrap items-center gap-3">
                  <Button
                    variant="outline"
                    :disabled="generateToken.isPending.value"
                    @click="generateCode"
                  >
                    Regenerate code
                  </Button>
                  <p class="text-sm text-muted-foreground">Valid for 10 minutes.</p>
                </div>
              </template>

              <template v-else>
                <Button
                  class="w-fit"
                  :disabled="generateToken.isPending.value"
                  @click="generateCode"
                >
                  <Icon icon="lucide:link" class="mr-2 h-4 w-4" />
                  {{ generateToken.isPending.value ? "Generating..." : "Generate code" }}
                </Button>
              </template>
            </div>
          </section>
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
