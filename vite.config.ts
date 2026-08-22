import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: [
      "contrib/**",
      "docs/**",
      "junk/**",
      "tools/**",
      "**/coverage/**",
      "**/dist/**",
      "**/.wrangler/**",
      "**/*.db",
      "**/.agents/**",
      "**/db/migrations**",
      "CHANGELOG.md",
      "worker-configuration.d.ts",
    ],
  },
  lint: {
    ignorePatterns: [
      "contrib/**",
      "docs/**",
      "junk/**",
      "tools/**",
      "**/dist/**",
      "**/.wrangler/**",
      "**/*.db",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
});
