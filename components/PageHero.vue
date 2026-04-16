<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description: string;
  centered?: boolean;
  statLabel?: string;
  statValue?: string | number;
}>();
</script>

<template>
  <section
    :class="`mx-auto grid max-w-6xl gap-8 px-0 py-14 sm:px-6 ${centered ? 'justify-items-center text-center md:grid-cols-1' : 'md:grid-cols-[minmax(0,1fr)_300px] md:items-end'}`"
  >
    <div :class="centered ? 'mx-auto max-w-3xl' : ''">
      <p v-if="eyebrow" class="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-accent)]">{{ eyebrow }}</p>
      <h1 class="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--blog-ink)] md:text-5xl">{{ title }}</h1>
      <p class="mt-5 max-w-2xl text-base leading-8 text-[var(--blog-muted)] md:text-lg">{{ description }}</p>
    </div>

    <div v-if="statLabel" class="blog-panel h-full p-6">
      <p class="text-sm text-[var(--blog-muted)]">{{ statLabel }}</p>
      <p class="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[var(--blog-ink)]">{{ statValue }}</p>
    </div>
  </section>
</template>
