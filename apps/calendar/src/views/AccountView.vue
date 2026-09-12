<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import MyDuConnection from "@/components/MyDuConnection.vue";
import MoodleConnection from "@/components/MoodleConnection.vue";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher.vue";
import { useClearSession, useSessionQuery } from "@/lib/api/session";
import TelegramConnection from "@/components/TelegramConnection.vue";
import { authClient } from "@/lib/auth-client";

const router = useRouter();

const { data: session } = useSessionQuery();

const clearSession = useClearSession();

const signingOut = ref(false);

const error = ref("");

async function signOut() {
  signingOut.value = true;

  try {
    const result = await authClient.signOut();

    if (result.error) {
      throw result.error;
    }

    clearSession();
    await router.replace("/");
  } catch {
    error.value = "Could not sign out. Please try again.";
  } finally {
    signingOut.value = false;
  }
}
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <header class="border-b">
      <nav
        aria-label="Breadcrumb"
        class="mx-auto flex h-14 max-w-3xl items-center gap-3 px-5 sm:px-8"
      >
        <RouterLink
          to="/schedule"
          class="flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <Icon icon="lucide:arrow-left" class="size-4" /> Calendar
        </RouterLink>
        <span class="text-border" aria-hidden="true">/</span>
        <span class="text-sm font-medium" aria-current="page">Settings</span>
      </nav>
    </header>
    <main class="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div class="mb-10 space-y-2">
        <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
        <p class="text-sm text-muted-foreground">Manage your schedule connection and account.</p>
      </div>
      <div class="divide-y">
        <MyDuConnection class="pb-8" />
        <MoodleConnection />
        <TelegramConnection />
        <section
          class="flex items-center justify-between gap-4 py-8"
          aria-labelledby="appearance-heading"
        >
          <div class="space-y-1.5">
            <h2 id="appearance-heading" class="text-base font-semibold">Appearance</h2>
            <p class="text-sm text-muted-foreground">Choose a light or dark theme.</p>
          </div>
          <ThemeSwitcher v-slot="{ theme, toggleTheme }">
            <Button
              variant="outline"
              :aria-label="`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`"
              @click="toggleTheme"
            >
              <Icon :icon="theme === 'light' ? 'lucide:sun' : 'lucide:moon'" class="size-4" />{{
                theme === "light" ? "Light" : "Dark"
              }}
            </Button>
          </ThemeSwitcher>
        </section>
        <section
          v-if="session?.data"
          class="flex flex-wrap items-center justify-between gap-4 py-8"
          aria-labelledby="account-heading"
        >
          <div class="min-w-0 space-y-1.5">
            <h2 id="account-heading" class="text-base font-semibold">
              {{ session.data.user.name || "Account" }}
            </h2>
            <p class="break-all text-sm text-muted-foreground">{{ session.data.user.email }}</p>
          </div>
          <Button variant="outline" :disabled="signingOut" @click="signOut">{{
            signingOut ? "Signing out…" : "Sign out"
          }}</Button>
        </section>
      </div>
      <p v-if="error" role="alert" class="text-sm text-destructive">{{ error }}</p>
    </main>
  </div>
</template>
