<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}>();
</script>

<template>
  <div class="blog-panel p-8 text-center">
    <h2 class="text-2xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">{{ title }}</h2>
    <p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--blog-muted)]">{{ description }}</p>
    <NuxtLink v-if="actionLabel && actionHref" :to="actionHref" class="blog-button-primary mt-6">
      {{ actionLabel }}
    </NuxtLink>
  </div>
</template>
