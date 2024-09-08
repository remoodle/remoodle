<script setup lang="ts">
import { Link } from "@/shared/ui/link";
import { MonoLogo } from "@/shared/ui/logo";
import { RouteName } from "@/shared/lib/routes";
import { ThemeSwitcher } from "@/features/theme-switcher";
import ClientVersion from "./ClientVersion.vue";

withDefaults(
  defineProps<{
    slim?: boolean;
  }>(),
  {
    slim: false,
  },
);
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
      <Link :to="{ name: RouteName.Home }" hover>
        <MonoLogo />
      </Link>
      <div
        class="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t py-4"
      >
        <div class="flex flex-wrap gap-2 text-muted-foreground">
          <ClientVersion />
        </div>
        <ThemeSwitcher class="flex-none" />
      </div>
    </footer>
  </template>
</template>
