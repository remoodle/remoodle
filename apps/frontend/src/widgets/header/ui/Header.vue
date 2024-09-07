<script setup lang="ts">
import { useRoute } from "vue-router";
import { Link } from "@/shared/ui/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Avatar } from "@/shared/ui/avatar";
import { Logo } from "@/shared/ui/logo";
import { useUserStore } from "@/shared/stores/user";
import { RouteName } from "@/shared/lib/routes";
import MagicSearch from "./MagicSearch.vue";

const route = useRoute();

const userStore = useUserStore();
</script>

<template>
  <header
    class="top-0 z-[20] flex h-16 w-full flex-none justify-center bg-background shadow-sm"
    :class="{ sticky: !route.meta.unstickyHeader }"
  >
    <div class="container flex h-full w-full items-center justify-between">
      <div class="inline-flex w-1/2 items-center justify-start">
        <Link :to="{ name: RouteName.Home }">
          <Logo class="h-12 w-12 flex-none" />
        </Link>
      </div>
      <div class="flex-shrink-1 hidden h-full w-full justify-center lg:flex">
        <!-- <MagicSearch /> -->
      </div>
      <div class="ml-auto inline-flex w-1/2 items-center justify-end">
        <DropdownMenu v-if="userStore.user" :modal="false">
          <DropdownMenuTrigger>
            <Avatar :name="userStore.user.moodleId" :size="36" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <RouterLink :to="{ name: RouteName.Account }">
              <DropdownMenuItem> Account </DropdownMenuItem>
            </RouterLink>
            <DropdownMenuItem @click="userStore.logout">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>
