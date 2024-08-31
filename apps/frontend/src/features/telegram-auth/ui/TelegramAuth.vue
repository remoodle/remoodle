<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { OnTelegramAuth } from "../lib";

const props = withDefaults(
  defineProps<{
    telegramLogin: string;
    requestAccess?: "read" | "write";
    size?: "small" | "medium" | "large";
    userpic?: boolean;
    radius?: string;
  }>(),
  {
    requestAccess: "read",
    size: "large",
    userpic: true,
  },
);

const emit = defineEmits(["callback", "loaded"]);

const onTelegramAuth: OnTelegramAuth = (user) => {
  emit("callback", user);
};

const telegram = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://telegram.org/js/telegram-widget.js?3";
  script.setAttribute("data-telegram-login", props.telegramLogin);
  script.setAttribute("data-size", props.size);
  script.setAttribute("data-userpic", props.userpic.toString());
  script.setAttribute("data-request-access", props.requestAccess);
  script.setAttribute("data-onauth", "onTelegramAuth(user)");
  script.onload = () => {
    emit("loaded");
  };
  if (props.radius) {
    script.setAttribute("data-radius", props.radius);
  }

  // @ts-ignore
  window.onTelegramAuth = onTelegramAuth;

  if (telegram.value) {
    telegram.value.appendChild(script);
  }
});
</script>

<template>
  <div ref="telegram"></div>
</template>
