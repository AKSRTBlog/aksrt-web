<script setup lang="ts">
import {
  fetchAllPublicArticles,
  fetchPublicArticleDetail,
  formatDate,
  sortArticles,
} from '~/composables/api';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

// 核心数据阻塞加载（文章详情）
const { data: article } = await useAsyncData(() => `article-${slug.value}`, () => fetchPublicArticleDetail(slug.value));

// 上下篇和推荐文章数据非阻塞加载（lazy: true）
const { data: allArticles } = useAsyncData('shared-all-articles', fetchAllPublicArticles, { lazy: true });

const orderedArticles = computed(() => sortArticles(allArticles.value || [], 'latest'));
const articleIndex = computed(() => orderedArticles.value.findIndex((item) => item.slug === article.value?.slug));
const olderArticle = computed(() => articleIndex.value >= 0 ? orderedArticles.value[articleIndex.value + 1] || null : null);
const newerArticle = computed(() => articleIndex.value > 0 ? orderedArticles.value[articleIndex.value - 1] || null : null);
const primaryCategory = computed(() => article.value?.categories?.[0] || null);
const articleAuthorName = computed(() => siteSettings.value?.aboutDisplayName?.trim() || 'Admin');
const canonicalUrl = computed(() => {
  const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, '') || '';
  return article.value && base ? `${base}/articles/${article.value.slug}` : '';
});

const relatedArticles = computed(() => {
  if (!article.value) {
    return [];
  }

  const categorySlugs = new Set(article.value.categories.map((item) => item.slug));
  return orderedArticles.value
    .filter((item) => item.id !== article.value?.id && item.categories.some((cat) => categorySlugs.has(cat.slug)))
    .slice(0, 3);
});

// OG 图片：优先使用文章特色图，回退到站点 Logo
const ogImage = computed(() => {
  return article.value?.coverImage || siteSettings.value?.logoUrl || '';
});

useSeoMeta({
  title: () => article.value?.title || 'Article',
  description: () => article.value?.excerpt || siteSettings.value?.siteDescription || '',
  ogImage: () => ogImage.value,
  ogImageUrl: () => ogImage.value,
  ogType: 'article',
});

useHead(() => ({
  link: canonicalUrl.value
    ? [
        {
          rel: 'canonical',
          href: canonicalUrl.value,
        },
      ]
    : [],
  meta: canonicalUrl.value ? [{ property: 'og:url', content: canonicalUrl.value }] : [],
}));
</script>

<template>
  <div v-if="article" class="pb-20">
    <section class="mx-auto max-w-7xl px-0 pt-4 sm:px-6">
      <div class="blog-panel overflow-hidden rounded-none sm:rounded-[4px]">
        <div class="p-6 md:p-8 lg:p-10">
          <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--blog-muted)]">
            <NuxtLink class="text-[var(--blog-accent)] transition hover:underline" to="/">Home</NuxtLink>
            <span>/</span>
            <NuxtLink class="transition hover:text-[var(--blog-ink)]" to="/articles">Articles</NuxtLink>
            <span>/</span>
            <span>{{ primaryCategory?.name || 'Uncategorized' }}</span>
          </div>

          <div class="mt-6 flex flex-wrap gap-2">
            <NuxtLink v-for="item in article.tags" :key="item.id" class="blog-filter" :to="`/tags/${item.slug}`">#{{ item.name }}</NuxtLink>
          </div>

          <div class="mt-8 max-w-4xl">
            <h1 class="text-2xl font-semibold leading-tight tracking-[-0.03em] text-[var(--blog-ink)] md:text-4xl">{{ article.title }}</h1>
            <p class="mt-4 max-w-3xl text-base leading-8 text-[var(--blog-muted)]">{{ article.excerpt }}</p>

            <ul class="mt-8 flex flex-wrap gap-4 text-sm text-[var(--blog-muted)]">
              <li>Author: {{ articleAuthorName }}</li>
              <li>Category: {{ article.categories.map((item) => item.name).join(' / ') || 'Uncategorized' }}</li>
              <li>Published: {{ formatDate(article.publishedAt) }}</li>
              <li>Reading time: {{ article.readingTime }} min</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-[var(--blog-border)]">
          <MarkdownContent :content="article.content" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-0 pt-0 sm:px-6">
      <div class="mt-8 blog-panel rounded-none px-6 py-6 sm:rounded-[4px] md:px-10 md:py-8">
        <div v-if="!allArticles" class="text-center text-sm text-[var(--blog-subtle)]">Loading navigation...</div>
        <div v-else class="flex flex-col gap-5 md:flex-row md:justify-between md:gap-6">
          <div class="flex w-full flex-col text-[var(--blog-muted)] md:w-1/2">
            <span class="text-xs uppercase tracking-[0.18em] text-[var(--blog-subtle)]">Older post</span>
            <NuxtLink
              v-if="olderArticle"
              class="mt-2 inline-flex items-center gap-2 text-base font-medium leading-7 text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
              :to="`/articles/${olderArticle.slug}`"
            >
              {{ olderArticle.title }}
            </NuxtLink>
            <NuxtLink v-else class="mt-2 text-base font-medium leading-7 text-[var(--blog-subtle)]" to="/articles">Browse all articles</NuxtLink>
          </div>

          <div class="flex w-full flex-col text-left text-[var(--blog-muted)] md:w-1/2 md:items-end">
            <span class="text-xs uppercase tracking-[0.18em] text-[var(--blog-subtle)]">Newer post</span>
            <NuxtLink
              v-if="newerArticle"
              class="mt-2 inline-flex items-center gap-2 text-base font-medium leading-7 text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)] md:text-right"
              :to="`/articles/${newerArticle.slug}`"
            >
              {{ newerArticle.title }}
            </NuxtLink>
            <NuxtLink v-else class="mt-2 text-base font-medium leading-7 text-[var(--blog-subtle)] md:text-right" to="/articles">No newer article</NuxtLink>
          </div>
        </div>
      </div>

      <CommentSection :article-slug="article.slug" :allow-comment="article.allowComment" />
    </section>

    <section v-if="relatedArticles.length > 0" class="mt-16 border-t border-[var(--blog-border)] bg-white/70 py-16">
      <div class="mx-auto max-w-7xl px-0 sm:px-6">
        <div class="px-6 md:px-10">
          <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Related</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">Related reads</h2>
            </div>
            <NuxtLink class="text-sm font-medium text-[var(--blog-accent)]" :to="primaryCategory ? `/categories/${primaryCategory.slug}` : '/articles'">
              More in this category
            </NuxtLink>
          </div>

          <div class="mt-8 grid gap-4 md:grid-cols-3">
            <ArticleCard v-for="item in relatedArticles" :key="item.id" :article="item" variant="compact" />
          </div>
        </div>
      </div>
    </section>
  </div>

  <section v-else class="mx-auto max-w-4xl px-6 py-16">
    <EmptyState
      title="Article not found"
      description="The requested article is unavailable or has been removed."
      action-label="Back to articles"
      action-href="/articles"
    />
  </section>
</template>
