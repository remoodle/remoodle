import "./shared/assets/base.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import {
  VueQueryPlugin,
  type VueQueryPluginOptions,
} from "@tanstack/vue-query";

import App from "./app/App.vue";
import router from "./app/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
};

app.use(VueQueryPlugin, vueQueryPluginOptions);

app.mount("#app");
