<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { Moon, Sun } from "lucide-vue-next";
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

const props = defineProps<{
  name?: string | null;
  email?: string | null;
}>();

const emit = defineEmits<{
  signOut: [];
}>();

const router = useRouter();

const displayName = computed(() => props.name || props.email || "Account");
const initials = computed(
  () =>
    displayName.value
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "A",
);

function openAccount() {
  router.push("/account");
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="size-8 rounded-lg">
              <AvatarFallback class="rounded-lg">
                {{ initials }}
              </AvatarFallback>
            </Avatar>

            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-medium">{{ displayName }}</span>
              <span class="truncate text-xs text-muted-foreground">
                {{ props.email }}
              </span>
            </div>

            <Icon icon="lucide:chevrons-up-down" class="size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align="end"
          class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-2xl"
        >
          <DropdownMenuLabel class="p-1 font-normal">
            <div class="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left">
              <Avatar class="size-8 rounded-lg">
                <AvatarFallback class="rounded-lg">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>

              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">{{ displayName }}</span>
                <span class="truncate text-xs text-muted-foreground">
                  {{ props.email }}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem @click="openAccount">
              <Icon icon="lucide:user-round" class="size-4" />
              Account
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <div class="flex items-center justify-between gap-3 px-2 py-2 text-sm">
            <span class="text-muted-foreground">Theme</span>

            <ThemeSwitcher v-slot="{ theme, toggleTheme }">
              <Button variant="outline" size="icon" class="size-8" @click="toggleTheme">
                <Sun v-if="theme === 'light'" class="h-4 w-4" />
                <Moon v-else class="h-4 w-4" />
              </Button>
            </ThemeSwitcher>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem as-child>
              <a
                href="https://github.com/remoodle/heresy"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon icon="mdi:github" class="size-4" />
                GitHub
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem @click="emit('signOut')">
              <Icon icon="lucide:log-out" class="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
