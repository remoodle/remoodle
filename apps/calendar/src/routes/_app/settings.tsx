import { createFileRoute } from "@tanstack/react-router";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTheme } from "@/hooks/use-theme";
import type { ThemePreference } from "@/lib/theme";
import { MoodleSettings } from "./-components/moodle-settings";
import { MyDuSettings } from "./-components/my-du-settings";
import { SettingsSection, SettingsSectionHeader } from "./-components/settings-section";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · ReMoodle" }] }),
  component: SettingsPage,
});

const themes = [
  ["system", "System", MonitorIcon],
  ["light", "Light", SunIcon],
  ["dark", "Dark", MoonIcon],
] as const satisfies [ThemePreference, string, typeof SunIcon][];

function SettingsPage() {
  const { links, user } = Route.useRouteContext();
  const { preference, setPreference } = useTheme();

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <header className="flex h-14 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
      </header>
      <div className="mx-auto flex max-w-3xl flex-col divide-y px-5 py-10">
        <MyDuSettings />
        <MoodleSettings />
        <SettingsSection>
          <SettingsSectionHeader
            title="Appearance"
            description="Light, dark, or whatever your device uses."
          >
            <ToggleGroup
              type="single"
              value={preference}
              aria-label="Theme"
              onValueChange={(value) => {
                const next = themes.find(([theme]) => theme === value);

                if (next) setPreference(next[0]);
              }}
            >
              {themes.map(([value, label, Icon]) => (
                <ToggleGroupItem key={value} value={value}>
                  <Icon data-icon="inline-start" />
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </SettingsSectionHeader>
        </SettingsSection>
        <SettingsSection>
          <SettingsSectionHeader
            title={user.name || "Account"}
            description={
              <>
                Signed in with Telegram{user.username && ` as @${user.username}`}. Reminders live in{" "}
                <a
                  href={links.bot}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4"
                >
                  the ReMoodle bot
                </a>
                .
              </>
            }
          />
        </SettingsSection>
      </div>
    </div>
  );
}
