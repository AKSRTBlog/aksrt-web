<script setup lang="ts">
import {
  deriveTags,
  fetchAllPublicArticles,
  fetchPublicCategories,
  mergeCategories,
} from '~/composables/api';

const {
  data: taxonomyData,
  pending,
  refresh,
} = await useAsyncData('sidebar-taxonomy', async () => {
  const [articleResult, categoryResult] = await Promise.all([
    fetchAllPublicArticles(),
    fetchPublicCategories(),
  ]);

  return {
    articles: articleResult ?? [],
    publicCategories: categoryResult ?? [],
  };
}, {
  default: () => ({
    articles: [],
    publicCategories: [],
  }),
});

usePublicLiveReload(() => refresh());

const categories = computed(() =>
  mergeCategories(taxonomyData.value.publicCategories, taxonomyData.value.articles)
    .filter((item) => item.count > 0),
);

const tags = computed(() =>
  deriveTags(taxonomyData.value.articles)
    .filter((item) => item.count > 0),
);
</script>

<template>
  <div v-if="pending" class="space-y-6">
    <div class="space-y-3">
      <div class="h-3 w-16 animate-pulse rounded bg-[var(--blog-soft)]" />
      <div class="space-y-2">
        <div v-for="index in 4" :key="`cat-skeleton-${index}`" class="h-9 animate-pulse rounded-[4px] bg-[var(--blog-soft)]" />
      </div>
    </div>
    <div class="space-y-3">
      <div class="h-3 w-16 animate-pulse rounded bg-[var(--blog-soft)]" />
      <div class="flex flex-wrap gap-2">
        <div v-for="index in 8" :key="`tag-skeleton-${index}`" class="h-7 w-16 animate-pulse rounded-full bg-[var(--blog-soft)]" />
      </div>
    </div>
  </div>

  <div v-else-if="categories.length || tags.length" class="space-y-6">
    <section v-if="categories.length" aria-labelledby="sidebar-categories-title">
      <p id="sidebar-categories-title" class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">
        Categories
      </p>
      <div class="mt-3 space-y-1">
        <NuxtLink
          v-for="category in categories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
        >
          <span class="truncate">{{ category.name }}</span>
          <span class="rounded-full bg-[var(--blog-soft)] px-2 py-0.5 text-[11px] text-[var(--blog-subtle)]">
            {{ category.count }}
          </span>
        </NuxtLink>
      </div>
    </section>

    <section v-if="tags.length" aria-labelledby="sidebar-tags-title">
      <p id="sidebar-tags-title" class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">
        Tags
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in tags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded-full border border-[var(--blog-border)] px-3 py-1.5 text-xs font-medium text-[var(--blog-muted)] transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
        >
          #{{ tag.name }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>
