<script setup lang="ts">
import { Icon } from "@/shared/ui/icon";
import { Link } from "@/shared/ui/link";
import { RouteName } from "@/shared/lib/routes";
import { useUserStore } from "@/shared/stores/user";

const userStore = useUserStore();
</script>

<template>
  <div
    v-if="
      userStore.authorized &&
      !userStore.user?.telegramId &&
      userStore.showTelegramBanner
    "
    class="top-0 z-50 mb-2 w-full bg-gradient-to-r from-[#2AABEE] to-[#229ED9] p-3 text-center text-sm font-medium text-white md:text-base"
  >
    <div class="flex items-center justify-center gap-4">
      <p>
        tip: Connect
        <span>
          Telegram
          <Icon name="telegram" class="inline-block h-5 w-5" />
        </span>
        in
        <Link :to="{ name: RouteName.AccountNotifications }" underline>
          account settings
        </Link>
        to receive grades and deadlines notifications
      </p>
      <button @click="userStore.closeTelegramBanner()">
        <Icon name="close" class="h-6 w-6" />
      </button>
    </div>
  </div>
</template>
