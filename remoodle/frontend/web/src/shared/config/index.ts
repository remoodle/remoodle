import type { Providers } from "../types";

export const githubOrgURL = "https://github.com/remoodle";

export const telegramChat = "https://t.me/remoodle";

export const defaultProviders: Providers = Object.freeze({
  "aitu-341eb7e7-556a-4702-8c93-3423eadf94a2": {
    name: "Astana IT University",
    description: "Our primary AITU instance",
    api: "https://aitu0.remoodle.app",
    // privacy: "https://ext.remoodle.app/NXY",
    moodle: {
      requiresTokenGeneration: false,
    },
  },
  // "nu-dc035a6f-099a-449a-bb87-0bac84f57e61": {
  //   name: "Nazarbayev University",
  //   description: "Experimental NU instance",
  //   api: "https://nu0.remoodle.app",
  //   // privacy: "https://ext.remoodle.app/cz0",
  //   moodle: {
  //     requiresTokenGeneration: true,
  //   },
  // },
});
