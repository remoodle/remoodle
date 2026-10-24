import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ChevronsUpDownIcon, CodeIcon, LogOutIcon, PaletteIcon, Settings2Icon } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useTheme } from "@/hooks/use-theme";
import { initials } from "@/lib/initials";
import type { ThemePreference } from "@/lib/theme";
import { signOut } from "@/server/auth.functions";

const themes = [
  ["system", "Match system"],
  ["light", "Light"],
  ["dark", "Dark"],
] as const satisfies [ThemePreference, string][];

export function NavUser() {
  const { user } = useRouteContext({ from: "/_app" });
  const { preference, setPreference } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const name = user.name || user.username || "Account";

  const signOutMutation = useMutation({
    mutationFn: useServerFn(signOut),
    onSuccess: async () => {
      // Personal data must not outlive the session, even in memory.
      queryClient.clear();
      await navigate({ to: "/" });
    },
    onError: () => toast.error("Could not sign out. Try again."),
  });

  const profile = (
    <>
      <Avatar>
        <AvatarFallback>{initials(name)}</AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {user.username ? `@${user.username}` : "Telegram"}
        </span>
      </div>
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              {profile}
              <ChevronsUpDownIcon />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
          >
            <DropdownMenuLabel className="flex items-center gap-2 font-normal">
              {profile}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/settings">
                  <Settings2Icon />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <PaletteIcon />
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    value={preference}
                    onValueChange={(value) => {
                      const next = themes.find(([theme]) => theme === value);

                      if (next) setPreference(next[0]);
                    }}
                  >
                    {themes.map(([value, label]) => (
                      <DropdownMenuRadioItem key={value} value={value}>
                        {label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem asChild>
                <a
                  href="https://github.com/remoodle/heresy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CodeIcon />
                  GitHub
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                disabled={signOutMutation.isPending}
                onSelect={() => signOutMutation.mutate({})}
              >
                <LogOutIcon />
                {signOutMutation.isPending ? "Signing out…" : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
