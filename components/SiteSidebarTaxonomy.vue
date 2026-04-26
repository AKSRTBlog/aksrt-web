<script setup lang="ts">
import {
  deriveTags,
  fetchAllPublicArticles,
  fetchPublicCategories,
  mergeCategories,
} from '~/composables/api';

const CATEGORY_LIMIT = 6;
const TAG_LIMIT = 14;

const categoriesExpanded = ref(false);
const tagsExpanded = ref(false);

const {
  data: taxonomyData,
  pending,
  refresh,
} = useAsyncData('sidebar-taxonomy', async () => {
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

const maxCategoryCount = computed(() => Math.max(1, ...categories.value.map((item) => item.count)));
const maxTagCount = computed(() => Math.max(1, ...tags.value.map((item) => item.count)));
const visibleCategories = computed(() => categoriesExpanded.value ? categories.value : categories.value.slice(0, CATEGORY_LIMIT));
const visibleTags = computed(() => tagsExpanded.value ? tags.value : tags.value.slice(0, TAG_LIMIT));

function isHotCategory(count: number) {
  return count >= maxCategoryCount.value;
}

function tagWeight(count: number) {
  if (maxTagCount.value <= 1) {
    return 0;
  }
  return Math.min(1, count / maxTagCount.value);
}

function tagClass(count: number) {
  const weight = tagWeight(count);
  if (weight >= 0.75) {
    return 'border-[var(--blog-accent)] bg-[var(--blog-soft)] text-[var(--blog-ink)] text-sm';
  }
  if (weight >= 0.45) {
    return 'border-[var(--blog-border)] bg-white text-[var(--blog-ink)]';
  }
  return 'border-[var(--blog-border)] text-[var(--blog-muted)]';
}
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
          v-for="category in visibleCategories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          class="flex items-center justify-between rounded-2xl border px-4 py-2.5 text-sm font-medium transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
          :class="isHotCategory(category.count) ? 'border-[var(--blog-accent)] bg-[var(--blog-soft)] text-[var(--blog-ink)]' : 'border-transparent text-[var(--blog-muted)]'"
        >
          <span class="truncate">{{ category.name }}</span>
          <span class="rounded-full bg-[var(--blog-soft)] px-2 py-0.5 text-[11px] text-[var(--blog-subtle)]">
            {{ category.count }}
          </span>
        </NuxtLink>
      </div>
      <button
        v-if="categories.length > CATEGORY_LIMIT"
        class="mt-2 text-xs font-semibold text-[var(--blog-accent)] transition hover:text-[var(--blog-ink)]"
        type="button"
        :aria-expanded="categoriesExpanded"
        @click="categoriesExpanded = !categoriesExpanded"
      >
        {{ categoriesExpanded ? '收起分类' : `展开 ${categories.length - CATEGORY_LIMIT} 个分类` }}
      </button>
    </section>

    <section v-if="tags.length" aria-labelledby="sidebar-tags-title">
      <p id="sidebar-tags-title" class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">
        Tags
      </p>
      <div class="mt-3 flex flex-wrap gap-2">
        <NuxtLink
          v-for="tag in visibleTags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          class="rounded-full border px-3 py-1.5 font-medium transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
          :class="tagClass(tag.count)"
          :title="`${tag.name}：${tag.count} 篇文章`"
        >
          #{{ tag.name }}
          <span class="ml-1 text-[10px] opacity-60">{{ tag.count }}</span>
        </NuxtLink>
      </div>
      <button
        v-if="tags.length > TAG_LIMIT"
        class="mt-3 text-xs font-semibold text-[var(--blog-accent)] transition hover:text-[var(--blog-ink)]"
        type="button"
        :aria-expanded="tagsExpanded"
        @click="tagsExpanded = !tagsExpanded"
      >
        {{ tagsExpanded ? '收起标签' : `展开 ${tags.length - TAG_LIMIT} 个标签` }}
      </button>
    </section>
  </div>
</template>
