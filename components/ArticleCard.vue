<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { BlogArticleSummary } from '~/types/blog';
import { formatDate } from '~/composables/api';

withDefaults(defineProps<{
  article: BlogArticleSummary;
  variant?: 'default' | 'featured' | 'compact' | 'horizontal';
}>(), {
  variant: 'default',
});

function estimateCardReadingTime(article: BlogArticleSummary) {
  return Math.max(1, Math.ceil((article.excerpt.length || 120) / 220));
}

const uncategorizedLabel = 'Uncategorized';
const siteSettings = inject<ReturnType<typeof useAsyncData>['value'] | undefined>('site-settings', undefined);
const articleAuthorName = computed(() => siteSettings?.value?.aboutDisplayName?.trim() || 'Admin');
</script>

<template>
  <NuxtLink :to="`/articles/${article.slug}`" class="group block">
    <article v-if="variant === 'featured'" class="blog-panel overflow-hidden">
      <div class="relative aspect-[16/10] overflow-hidden">
        <AppImage
          class="h-full w-full object-cover transform-gpu will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
          :src="article.coverImage"
          :alt="article.title"
          loading="eager"
          fetchpriority="high"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-[rgba(17,24,39,0.7)] via-transparent to-transparent" />
        <div class="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[var(--blog-ink)]">
          {{ article.categories?.[0]?.name || uncategorizedLabel }}
        </div>
        <div class="absolute bottom-5 left-5 right-5">
          <h3 class="text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">{{ article.title }}</h3>
        </div>
      </div>
      <div class="p-6">
        <p class="line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]">{{ article.excerpt }}</p>
        <div class="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--blog-subtle)]">
          <span>{{ formatDate(article.publishedAt) }}</span>
          <span>/</span>
          <span>{{ estimateCardReadingTime(article) }} min read</span>
        </div>
      </div>
    </article>

    <article v-else-if="variant === 'horizontal'" class="flex items-stretch gap-3 py-5 sm:gap-4">
      <div class="min-w-0 flex-1">
        <h3 class="line-clamp-2 text-[0.95rem] font-semibold leading-[1.55] tracking-[-0.03em] text-[var(--blog-ink)] transition-colors group-hover:text-[var(--blog-accent)] sm:text-[1.12rem]">
          {{ article.title }}
        </h3>
        <p class="mt-2 line-clamp-2 text-xs leading-7 text-[var(--blog-muted)]">{{ article.excerpt }}</p>
        <div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--blog-subtle)] sm:text-xs">
          <span class="hidden font-medium text-[var(--blog-accent)] sm:inline">{{ article.categories?.[0]?.name || uncategorizedLabel }}</span>
          <span class="hidden sm:inline text-[var(--blog-border-strong)]">/</span>
          <span class="hidden sm:inline">{{ articleAuthorName }}</span>
          <span class="hidden sm:inline text-[var(--blog-border-strong)]">/</span>
          <span>{{ formatDate(article.publishedAt) }}</span>
        </div>
      </div>
      <div class="w-[30%] shrink-0 sm:w-36 md:w-64">
        <div class="h-[88px] overflow-hidden rounded-[3px] sm:h-[104px] md:h-[140px]">
          <AppImage
            class="h-full w-full object-cover transform-gpu will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
            :src="article.coverImage"
            :alt="article.title"
          />
        </div>
      </div>
    </article>

    <article v-else-if="variant === 'compact'" class="flex items-start gap-4 rounded-[4px] border border-[var(--blog-border)] bg-white/88 p-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]">
      <AppImage class="h-16 w-16 rounded-[4px] object-cover" :src="article.coverImage" :alt="article.title" />
      <div class="min-w-0 flex-1">
        <p class="text-xs font-medium text-[var(--blog-accent)]">{{ article.categories?.[0]?.name || uncategorizedLabel }}</p>
        <h4 class="mt-1 line-clamp-2 text-sm font-semibold text-[var(--blog-ink)]">{{ article.title }}</h4>
        <p class="mt-2 text-xs text-[var(--blog-subtle)]">{{ formatDate(article.publishedAt) }} / {{ estimateCardReadingTime(article) }} min read</p>
      </div>
    </article>

    <article v-else class="blog-panel overflow-hidden">
      <div class="aspect-[4/3] overflow-hidden">
        <AppImage
          class="h-full w-full object-cover transform-gpu will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none"
          :src="article.coverImage"
          :alt="article.title"
        />
      </div>
      <div class="p-6">
        <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--blog-accent)]">
          <span>{{ article.categories?.[0]?.name || uncategorizedLabel }}</span>
          <span class="text-[var(--blog-border-strong)]">/</span>
          <span class="text-[var(--blog-subtle)]">{{ formatDate(article.publishedAt) }}</span>
        </div>
        <h3 class="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-[var(--blog-ink)]">{{ article.title }}</h3>
        <p class="mt-3 line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]">{{ article.excerpt }}</p>
      </div>
    </article>
  </NuxtLink>
</template>
