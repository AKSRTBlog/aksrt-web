<script setup lang="ts">
import { buildArchiveGroups, fetchAllPublicArticles, formatLongDate } from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

// 纯客户端 AJAX 加载文章归档
const articles = ref<BlogArticleSummary[]>([]);
const loading = ref(true);
const error = ref('');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchAllPublicArticles();
    articles.value = data ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load archive.';
    articles.value = [];
  } finally {
    loading.value = false;
  }
}

usePublicLiveReload(loadData);

onMounted(() => {
  loadData();
});

const archiveGroups = computed(() => buildArchiveGroups(articles.value));

useSeoMeta({
  title: 'Archive',
  description: 'Browse published posts by year and month.',
});
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="space-y-6">
        <!-- 骨架屏 -->
        <div v-if="loading" class="space-y-8">
          <div v-for="yi in 2" :key="`y-skel-${yi}`" class="blog-panel p-8">
            <div class="flex items-end justify-between gap-4 mb-8">
              <div class="animate-pulse space-y-2">
                <div class="h-3 w-16 rounded bg-[var(--blog-soft)]" />
                <div class="h-8 w-20 rounded bg-[var(--blog-soft)]" />
              </div>
              <div class="animate-pulse h-4 w-16 rounded bg-[var(--blog-soft)]" />
            </div>
            <div class="space-y-4">
              <div v-for="mi in 3" :key="`m-skel-${mi}`" class="space-y-3">
                <div class="animate-pulse h-5 w-16 rounded bg-[var(--blog-soft)]" />
                <div class="animate-pulse flex items-center gap-3 rounded-[4px] border border-[var(--blog-border)] px-4 py-3">
                  <div class="animate-pulse h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
                  <div class="animate-pulse h-3 w-20 rounded bg-[var(--blog-soft)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="blog-panel flex flex-col items-center gap-3 px-8 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
          <button class="blog-button-secondary text-sm" @click="loadData">Retry</button>
        </div>

        <!-- 空归档 -->
        <EmptyState
          v-else-if="archiveGroups.length === 0"
          title="The archive is empty"
          description="No published articles are available yet."
          action-label="View articles"
          action-href="/articles"
        />

        <!-- 归档时间线 -->
        <template v-else>
          <TransitionGroup name="archive-fade" tag="div" appear>
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
          </TransitionGroup>
        </template>
      </div>
    </section>
  </div>
</template>

<style scoped>
.archive-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.archive-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
