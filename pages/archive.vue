<script setup lang="ts">
import { buildArchiveGroups, fetchAllPublicArticles, formatLongDate } from '~/composables/api';

const { data: articles, pending } = useAsyncData('shared-all-articles', fetchAllPublicArticles, { lazy: true });
const archiveGroups = computed(() => buildArchiveGroups(articles.value || []));

useSeoMeta({
  title: 'Archive',
  description: 'Browse published posts by year and month.',
});
</script>

<template>
  <div>
    <PageHero
      centered
      eyebrow="Archive"
      title="Timeline of posts"
      description="Browse the full publishing history by year and month."
    />

    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="space-y-6">
        <EmptyState
          v-if="pending"
          title="Loading archive…"
          description="Articles are being loaded."
        />
        <EmptyState
          v-else-if="archiveGroups.length === 0"
          title="The archive is empty"
          description="No published articles are available yet."
          action-label="View articles"
          action-href="/articles"
        />
        <div v-for="yearGroup in archiveGroups" :key="yearGroup.year" class="blog-panel p-8">
          <div class="flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Year</p>
              <h2 class="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">{{ yearGroup.year }}</h2>
            </div>
            <p class="text-sm text-[var(--blog-subtle)]">{{ yearGroup.total }} posts</p>
          </div>

          <div class="mt-8 space-y-6">
            <div v-for="monthGroup in yearGroup.months" :key="`${yearGroup.year}-${monthGroup.month}`">
              <div class="flex items-center justify-between gap-3">
                <h3 class="text-lg font-semibold text-[var(--blog-ink)]">{{ monthGroup.month }}</h3>
                <span class="text-xs text-[var(--blog-subtle)]">{{ monthGroup.items.length }} posts</span>
              </div>

              <div class="mt-4 space-y-3">
                <NuxtLink
                  v-for="article in monthGroup.items"
                  :key="article.id"
                  :to="`/articles/${article.slug}`"
                  class="flex flex-col gap-2 rounded-[4px] border border-[var(--blog-border)] px-4 py-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p class="text-sm font-semibold text-[var(--blog-ink)]">{{ article.title }}</p>
                    <p class="mt-1 text-xs text-[var(--blog-subtle)]">{{ article.categories?.[0]?.name || 'Uncategorized' }}</p>
                  </div>
                  <span class="text-xs text-[var(--blog-subtle)]">{{ formatLongDate(article.publishedAt) }}</span>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
