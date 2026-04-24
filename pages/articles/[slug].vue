<script setup lang="ts">
import { fetchAllPublicArticles, formatDate, sortArticles } from '~/composables/api';
import { usePublicArticleDetail } from '~/composables/usePublicArticleDetail';
import type { PublicCommentSubmissionResult } from '~/types/blog';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

const { article, pending, refresh, unlockArticle, unlockMessage } = usePublicArticleDetail(slug);
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

const articleLockPromptVisible = computed(() => {
  return Boolean(article.value?.requiresCommentUnlock && !article.value?.isUnlocked);
});

const articleBodyContent = computed(() => {
  return article.value?.content || '';
});

const relatedArticles = computed(() => {
  if (!article.value) {
    return [];
  }

  const categorySlugs = new Set(article.value.categories.map((item) => item.slug));
  return orderedArticles.value
    .filter((item) => item.id !== article.value?.id && item.categories.some((category) => categorySlugs.has(category.slug)))
    .slice(0, 3);
});

const ogImage = computed(() => article.value?.coverImage || siteSettings.value?.logoUrl || '');

async function handleCommentSubmitted(result: PublicCommentSubmissionResult) {
  if (result.unlockToken) {
    await unlockArticle(result.postId, result.unlockToken);
  }
}

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
          <Transition name="unlock-content" mode="out-in">
            <div :key="article.isUnlocked ? 'unlocked' : 'locked'">
              <MarkdownContent :content="articleBodyContent" :copy-code-blocks="true" />
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-0 pt-0 sm:px-6">
      <Transition name="unlock-banner">
        <div v-if="articleLockPromptVisible" class="mt-8 overflow-hidden rounded-none sm:rounded-[4px]">
          <div class="article-unlock-cta rounded-none border border-[color:color-mix(in_srgb,var(--blog-accent)_26%,white)] px-6 py-6 sm:rounded-[4px] md:px-8">
            <div class="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div class="max-w-2xl">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-accent)]">Comment To Unlock</p>
                <h2 class="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">Submit an approved comment to reveal the rest.</h2>
                <p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]">
                  We check new comments before unlocking hidden sections. Approved comments reveal the protected content automatically.
                </p>
                <p v-if="unlockMessage" class="mt-3 text-sm font-medium text-rose-600">
                  {{ unlockMessage }}
                </p>
              </div>
              <button class="article-unlock-cta__badge" type="button" @click="refresh()">
                <span class="article-unlock-cta__badge-icon">+</span>
                Check unlock status
              </button>
            </div>
          </div>
        </div>
      </Transition>

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

      <CommentSection :article-slug="article.slug" :allow-comment="article.allowComment" @submitted="handleCommentSubmitted" />
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

  <section v-else-if="pending" class="mx-auto max-w-4xl px-6 py-16">
    <div class="blog-panel rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      Loading article...
    </div>
  </section>

  <section v-else class="mx-auto max-w-4xl px-6 py-16">
    <EmptyState
      title="Article not found"
      description="The requested article is unavailable or has been removed."
      action-label="Back to articles"
      action-href="/articles"
    />
  </section>
</template>

<style scoped>
.unlock-content-enter-active,
.unlock-content-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.unlock-content-enter-from,
.unlock-content-leave-to {
  opacity: 0;
  transform: translateY(14px);
}

.unlock-banner-enter-active,
.unlock-banner-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.unlock-banner-enter-from,
.unlock-banner-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.article-unlock-cta {
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--blog-accent) 16%, white), transparent 48%),
    linear-gradient(135deg, color-mix(in srgb, var(--blog-surface) 92%, white), white);
  box-shadow: 0 22px 60px -42px color-mix(in srgb, var(--blog-accent) 65%, transparent);
}

.article-unlock-cta__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  align-self: flex-start;
  border: 1px solid color-mix(in srgb, var(--blog-accent) 24%, white);
  background: color-mix(in srgb, white 86%, var(--blog-accent));
  color: var(--blog-ink);
  padding: 0.9rem 1.15rem;
  font-size: 0.95rem;
  font-weight: 600;
  transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.article-unlock-cta__badge:hover {
  transform: translateY(-1px);
  border-color: color-mix(in srgb, var(--blog-accent) 42%, white);
  background: color-mix(in srgb, white 80%, var(--blog-accent));
}

.article-unlock-cta__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: var(--blog-accent);
  color: white;
  font-size: 1rem;
  line-height: 1;
}
</style>
