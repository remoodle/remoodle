<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { cn } from "@/shared/lib/helpers";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/ui/toast/use-toast";
import { request, getAuthHeaders } from "@/shared/lib/hc";
import { createAsyncProcess, vFocus } from "@/shared/lib/helpers";
import { useUserStore } from "@/shared/stores/user";
import { RouteName } from "@/shared/types";

const userStore = useUserStore();

const router = useRouter();

const form = ref({
  name: "",
  password: "",
});

const { toast } = useToast();

const { run: submit, loading } = createAsyncProcess(async () => {
  const [data, error] = await request((client) =>
    client.v1.auth.login.$post({
      json: {
        identifier: form.value.name,
        password: form.value.password,
      },
    }),
  );

  if (error) {
    toast({
      title: error.message,
    });
    throw error;
  }

  userStore.login(data.accessToken, data.refreshToken, data.user);
});
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <form @submit.prevent="submit">
      <div class="grid gap-5">
        <div class="grid gap-3">
          <div class="grid gap-1.5">
            <Label for="name">Username</Label>
            <Input
              v-focus
              v-model="form.name"
              placeholder="messi2009 / 222666@astanait.edu.kz"
              id="name"
              type="text"
              autocomplete="username"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="loading"
              required
            />
          </div>
          <div class="grid gap-1.5">
            <Label for="password">Password</Label>
            <Input
              v-model="form.password"
              placeholder="•••••••••••••"
              id="password"
              type="password"
              auto-capitalize="none"
              auto-correct="off"
              :disabled="loading"
              required
            />
          </div>
        </div>
        <Button :disabled="loading"> Sign In </Button>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          type="button"
          @click="router.push({ name: RouteName.Token })"
        >
          Moodle web service Token
        </Button>
      </div>
    </form>
  </div>
</template>
