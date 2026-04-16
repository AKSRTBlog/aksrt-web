<script setup lang="ts">
import type { BlogArticleSummary } from '~/types/blog';

withDefaults(defineProps<{
  articles: BlogArticleSummary[];
  view?: 'grid' | 'list';
}>(), {
  view: 'list',
});
</script>

<template>
  <div v-if="view === 'grid'" class="grid gap-6 md:grid-cols-2">
    <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
  </div>

  <div v-else class="overflow-hidden rounded-none border border-[var(--blog-border)] bg-white/88 sm:rounded-[4px]">
    <div class="divide-y divide-[var(--blog-border)] px-4 sm:px-6">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" variant="horizontal" />
    </div>
  </div>
</template>
