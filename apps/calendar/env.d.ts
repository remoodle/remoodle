/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Origin of the remoodle API. Leave unset to use same-origin `/api` (the dev server proxies it).
  readonly VITE_API_URL?: string;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<{}, {}, any>;

  export default component;
}
