<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useRoute } from "vue-router";
import { Footer } from "@/widgets/footer";
import { RouteName } from "@/shared/lib/routes";
import { Link } from "@/shared/ui/link";
import { features } from "@/shared/config/features";
import LoginForm from "./ui/LoginForm.vue";

const TokenForm = defineAsyncComponent(() => import("./ui/TokenForm.vue"));
const SignupForm = defineAsyncComponent(() => import("./ui/SignupForm.vue"));

const route = useRoute();
</script>

<template>
  <div
    class="container grid h-full grid-cols-1 flex-col items-center justify-center lg:max-w-none lg:px-0"
  >
    <div class="py-5"></div>
    <div
      class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[420px]"
    >
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-3xl font-semibold tracking-tight">
          <template v-if="route.name === RouteName.Login">
            Welcome back
          </template>
          <template v-else> Let's go! </template>
        </h1>
        <p class="text-muted-foreground">
          <template v-if="route.name === RouteName.Login">
            Enter your credentials below to login
          </template>
          <template v-else> Fill in your details to get started </template>
        </p>
      </div>
      <div class="rounded-lg lg:p-10">
        <template v-if="route.name === RouteName.Login">
          <LoginForm />
        </template>
        <template
          v-if="features.enableTokenAuth && route.name === RouteName.Token"
        >
          <TokenForm />
        </template>
        <template
          v-else-if="
            features.enableTokenAuth && route.name === RouteName.SignUp
          "
        >
          <SignupForm />
        </template>
      </div>

      <p
        v-if="features.enableTokenAuth"
        class="px-8 text-center text-sm text-muted-foreground"
      >
        {{
          route.name === RouteName.Login
            ? "Don't have an account?"
            : "Already have an account?"
        }}
        <Link
          underline
          hover
          :to="{
            name:
              route.name === RouteName.Login
                ? RouteName.SignUp
                : RouteName.Login,
          }"
        >
          {{ route.name === RouteName.Login ? "Sign up" : "Sign in" }}
        </Link>
      </p>
      <template v-if="route.name !== RouteName.Login">
        <p class="text-center text-sm text-muted-foreground">
          By continuing, you agree to our
          <br />
          <Link :to="{ name: RouteName.Terms }" underline hover
            >Terms of Service</Link
          >
          and
          <Link :to="{ name: RouteName.Privacy }" underline hover
            >Privacy Policy</Link
          >.
        </p>
      </template>
    </div>
    <Footer slim class="mt-auto" />
  </div>
</template>
