import { defineConfig } from "vitepress";

export default defineConfig({
  title: "ReMoodle",
  description: "ReMoodle Documentation",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/moodle-calendar-url" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          {
            text: "Get Moodle Calendar URL",
            link: "/guide/moodle-calendar-url",
          },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/aitu-dk/remoodle" }],
  },
});
