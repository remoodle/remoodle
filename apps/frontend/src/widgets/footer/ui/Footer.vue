<script setup lang="ts">
import { storeToRefs } from "pinia";
import { MonoLogo } from "@/widgets/logo";
import { ThemeSwitcher } from "@/features/theme-switcher";
import { ProviderDialog } from "@/entities/provider";
import { useAppStore } from "@/shared/stores/app";
import APIVersion from "./APIVersion.vue";
import ClientVersion from "./ClientVersion.vue";

const appStore = useAppStore();

withDefaults(
  defineProps<{
    slim?: boolean;
  }>(),
  {
    slim: false,
  },
);

const { providerId, availableProviders } = storeToRefs(appStore);
</script>

<template>
  <template v-if="slim">
    <footer class="py-6">
      <div class="mx-auto flex w-full items-center justify-center">
        <ul
          class="flex flex-wrap items-center justify-center gap-y-2 divide-secondary-foreground/50 leading-4 lg:divide-x-2 [&>*]:px-3"
        >
          <li>
            <ClientVersion />
          </li>
          <li>
            <ProviderDialog
              v-model:provider-id="providerId"
              v-model:providers="availableProviders"
            >
              <template #default="{ selectedProvider }">
                <p v-if="selectedProvider">
                  Connected to
                  {{ selectedProvider.name }}
                </p>
                <p v-else>Click here to select API Provider</p>
              </template>
            </ProviderDialog>
          </li>
          <li>
            <ThemeSwitcher v-slot="{ theme, toggleTheme }">
              <button @click="toggleTheme">{{ theme }}</button>
            </ThemeSwitcher>
          </li>
        </ul>
      </div>
    </footer>
  </template>
  <template v-else>
    <footer
      class="container flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-6"
    >
      <MonoLogo />
      <div
        class="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t py-4"
      >
        <div class="flex flex-wrap gap-2 text-muted-foreground">
          <ClientVersion />
          <ProviderDialog
            v-model:provider-id="providerId"
            v-model:providers="availableProviders"
          >
            <template #default="{ selectedProvider }">
              <APIVersion
                v-if="selectedProvider"
                :host="selectedProvider.api"
              />
            </template>
          </ProviderDialog>
          <!-- <APIVersion
            v-if="appStore.selectedProvider"
            :host="appStore.selectedProvider.api"
          /> -->
        </div>
        <ThemeSwitcher class="flex-none" />
      </div>
    </footer>
  </template>
</template>
