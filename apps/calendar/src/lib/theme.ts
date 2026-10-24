export type ThemePreference = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "remoodle-theme";

// Runs before first paint so a dark preference never flashes the light theme.
export const themeScript = `(() => {
  try {
    const stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    const dark = stored === "dark" || (stored !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})()`;
