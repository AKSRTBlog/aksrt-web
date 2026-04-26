<script setup lang="ts">
import {
  buildArchiveGroups,
  fetchAllPublicArticles,
  formatArchiveDate,
  formatLongDate,
} from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

const {
  data: archiveArticles,
  pending: loading,
  error: archiveError,
  refresh: refreshArchive,
} = await useAsyncData<BlogArticleSummary[]>('public-archive-articles', () => fetchAllPublicArticles(), {
  default: () => [],
});

usePublicLiveReload(() => refreshArchive());

const articles = computed(() => archiveArticles.value ?? []);
const archiveGroups = computed(() => buildArchiveGroups(articles.value));
const error = computed(() => archiveError.value?.message || '');
const totalArticles = computed(() => articles.value.length);
const totalYears = computed(() => archiveGroups.value.length);
const latestArticle = computed(() => articles.value[0] ?? null);

const archiveCanonicalUrl = computed(() => {
  const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, '') || '';
  return base ? `${base}/archive` : '';
});

function retryArchive() {
  return refreshArchive();
}

useSeoMeta({
  title: '文章归档',
  description: '按年份和月份浏览全部已发布文章。',
  ogTitle: '文章归档',
  ogDescription: '按年份和月份浏览全部已发布文章。',
});

useHead(() => ({
  link: archiveCanonicalUrl.value
    ? [
        {
          rel: 'canonical',
          href: archiveCanonicalUrl.value,
        },
      ]
    : [],
  meta: archiveCanonicalUrl.value
    ? [
        {
          property: 'og:url',
          content: archiveCanonicalUrl.value,
        },
      ]
    : [],
}));
</script>

<template>
  <div class="-mx-4 sm:mx-0">
    <section class="mx-auto max-w-6xl px-0 pb-20 sm:px-6">
      <div class="space-y-6">
        <header class="blog-panel p-6 sm:p-8">
          <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-2xl">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Archive</p>
              <h1 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)] sm:text-4xl">
                文章归档
              </h1>
              <p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]">
                按发布时间整理所有文章，快速回到某一年、某个月份，找到你想继续阅读的内容。
              </p>
            </div>

            <div class="grid grid-cols-3 gap-3 text-center sm:min-w-[360px]">
              <div class="rounded-[4px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-3 py-4">
                <p class="text-2xl font-semibold text-[var(--blog-ink)]">{{ totalArticles }}</p>
                <p class="mt-1 text-xs text-[var(--blog-subtle)]">篇文章</p>
              </div>
              <div class="rounded-[4px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-3 py-4">
                <p class="text-2xl font-semibold text-[var(--blog-ink)]">{{ totalYears }}</p>
                <p class="mt-1 text-xs text-[var(--blog-subtle)]">个年份</p>
              </div>
              <div class="rounded-[4px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-3 py-4">
                <p class="truncate text-2xl font-semibold text-[var(--blog-ink)]">
                  {{ latestArticle ? formatArchiveDate(latestArticle.publishedAt) : '--' }}
                </p>
                <p class="mt-1 text-xs text-[var(--blog-subtle)]">最近更新</p>
              </div>
            </div>
          </div>
        </header>

        <div v-if="loading" class="space-y-8">
          <div v-for="yi in 2" :key="`y-skel-${yi}`" class="blog-panel p-6 sm:p-8">
            <div class="mb-8 flex items-end justify-between gap-4">
              <div class="animate-pulse space-y-2">
                <div class="h-3 w-16 rounded bg-[var(--blog-soft)]" />
                <div class="h-8 w-20 rounded bg-[var(--blog-soft)]" />
              </div>
              <div class="h-4 w-16 animate-pulse rounded bg-[var(--blog-soft)]" />
            </div>
            <div class="space-y-4">
              <div v-for="mi in 3" :key="`m-skel-${mi}`" class="space-y-3">
                <div class="h-5 w-16 animate-pulse rounded bg-[var(--blog-soft)]" />
                <div class="flex animate-pulse items-center gap-3 rounded-[4px] border border-[var(--blog-border)] px-4 py-3">
                  <div class="h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
                  <div class="h-3 w-20 rounded bg-[var(--blog-soft)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="error" class="blog-panel flex flex-col items-center gap-3 px-8 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
          <button class="blog-button-secondary text-sm" type="button" @click="retryArchive">
            重新加载
          </button>
        </div>

        <EmptyState
          v-else-if="archiveGroups.length === 0"
          title="归档还是空的"
          description="目前还没有已发布文章，可以先去文章列表看看其他内容。"
          action-label="查看文章"
          action-href="/articles"
        />

        <TransitionGroup v-else name="archive-fade" tag="div" appear class="space-y-6">
          <div v-for="yearGroup in archiveGroups" :key="yearGroup.year" class="blog-panel p-6 sm:p-8">
            <div class="flex items-end justify-between gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Year</p>
                <h2 class="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">
                  {{ yearGroup.year }}
                </h2>
              </div>
              <p class="text-sm text-[var(--blog-subtle)]">{{ yearGroup.total }} 篇文章</p>
            </div>

            <div class="mt-8 space-y-6">
              <div v-for="monthGroup in yearGroup.months" :key="monthGroup.monthKey">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-lg font-semibold text-[var(--blog-ink)]">{{ monthGroup.month }}</h3>
                  <span class="text-xs text-[var(--blog-subtle)]">{{ monthGroup.items.length }} 篇</span>
                </div>

                <div class="mt-4 space-y-3">
                  <NuxtLink
                    v-for="article in monthGroup.items"
                    :key="article.id"
                    :to="`/articles/${article.slug}`"
                    class="flex flex-col gap-2 rounded-[4px] border border-[var(--blog-border)] px-4 py-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] md:flex-row md:items-center md:justify-between"
                  >
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-[var(--blog-ink)]">{{ article.title }}</p>
                      <p class="mt-1 truncate text-xs text-[var(--blog-subtle)]">
                        {{ article.categories?.[0]?.name || '未分类' }}
                      </p>
                    </div>
                    <time class="shrink-0 text-xs text-[var(--blog-subtle)]" :datetime="article.publishedAt">
                      {{ formatLongDate(article.publishedAt) }}
                    </time>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </TransitionGroup>
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
