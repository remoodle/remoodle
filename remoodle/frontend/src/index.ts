import "./app/styles/base.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./app/Entry.vue";
import router from "./app/router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
