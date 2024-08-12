<script setup lang="ts">
defineProps<{
  loading: boolean;
  error: {
    code: number;
    message: string;
  } | null;
}>();
</script>

<template>
  <template v-if="error">
    <slot name="error">
      <div class="m-auto flex h-[60vh] items-center justify-center">
        <div
          data-testid="error-404"
          class="flex flex-col items-center justify-center"
        >
          <span class="text-6xl"> 😢 </span>
          <span class="text-base-content/90 text-2xl font-bold">
            Something went wrong
          </span>
          <span class="text-base-content/80 text-base font-medium">
            {{ error.code }} -
            {{ error.message }}
          </span>
        </div>
      </div>
    </slot>
  </template>
  <template v-else>
    <slot />
  </template>
</template>
