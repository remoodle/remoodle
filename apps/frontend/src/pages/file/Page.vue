<script setup lang="ts">
import { watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuery } from "@tanstack/vue-query";
import { useUserStore } from "@/shared/stores/user";

const userStore = useUserStore();

const router = useRouter();
const route = useRoute();

const filepath = route.query.filepath as string;
const from = route.query.from as string;

const getCleanFilepath = () => {
  const url = new URL(filepath);
  url.search = "";
  url.hash = "";
  return url.toString();
};

const fetchFile = async () => {
  const url = new URL(getCleanFilepath());

  url.searchParams.set("token", userStore.user?.moodleToken ?? "");
  url.searchParams.set("forcedownload", "1");

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error("Failed to fetch file");
  }
  return response.blob();
};

const {
  data: fileBlob,
  isError,
  error,
} = useQuery({
  queryKey: ["file", getCleanFilepath()],
  queryFn: fetchFile,
  enabled: !!filepath,
  retry: 2,
});

watchEffect(() => {
  if (!fileBlob.value) {
    return;
  }

  const url = window.URL.createObjectURL(fileBlob.value);
  const link = document.createElement("a");
  link.href = url;
  link.download = getCleanFilepath().split("/").pop() ?? "file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  window.close();
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center">
    <div v-if="isError" class="text-destructive">
      {{ error?.message || "Download failed" }}
    </div>
    <p v-else class="text-muted-foreground">Starting download...</p>
  </div>
</template>
