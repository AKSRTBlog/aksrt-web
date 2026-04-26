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
const route = useRoute();
const currentPath = computed(() => route.path);
const tagsExpanded = ref(false);

/** 判断链接是否精确匹配当前路径 */
function isActiveLink(href: string) {
  return currentPath.value === href;
}

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
    return 'border-[var(--blog-accent)] bg-[var(--blog-accent)]/8 text-[var(--blog-ink)]';
  }
  if (weight >= 0.45) {
    return 'bg-[var(--blog-soft)] text-[var(--blog-ink)]';
  }
  return 'text-[var(--blog-muted)]';
}
</script>

<template>
  <div v-if="pending" class="space-y-7">
    <div class="space-y-3">
      <div class="h-3.5 w-14 animate-pulse rounded-md bg-[var(--blog-soft)]" />
      <div class="space-y-2">
        <div v-for="index in 4" :key="`cat-skeleton-${index}`" class="h-8 animate-pulse rounded-lg bg-[var(--blog-soft)]" />
      </div>
    </div>
    <div class="space-y-3">
      <div class="h-3.5 w-12 animate-pulse rounded-md bg-[var(--blog-soft)]" />
      <div class="flex flex-wrap gap-1.5">
        <div v-for="index in 8" :key="`tag-skeleton-${index}`" class="h-7 w-16 animate-pulse rounded-full bg-[var(--blog-soft)]" />
      </div>
    </div>
  </div>

  <div v-else-if="categories.length || tags.length" class="space-y-7">
    <!-- 分类列表 -->
    <section v-if="categories.length" aria-labelledby="sidebar-categories-title">
      <p id="sidebar-categories-title" class="text-xs font-bold text-[var(--blog-ink)]">分类</p>
      <div class="mt-3 space-y-0.5">
        <NuxtLink
          v-for="category in visibleCategories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          exact
          :class="[
            'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--blog-soft)]',
            isActiveLink(`/categories/${category.slug}`)
              ? 'bg-[var(--blog-accent)]/8 text-[var(--blog-accent)] font-semibold'
              : isHotCategory(category.count) ? 'text-[var(--blog-ink)] font-medium' : 'text-[var(--blog-muted)]'
          ]"
        >
          <span class="truncate">{{ category.name }}</span>
          <span class="shrink-0 ml-3 tabular-nums text-xs text-[var(--blog-subtle)]">{{ category.count }}</span>
        </NuxtLink>
      </div>
      <button
        v-if="categories.length > CATEGORY_LIMIT"
        class="mt-2 text-xs text-[var(--blog-subtle)] transition-colors hover:text-[var(--blog-accent)]"
        type="button"
        :aria-expanded="categoriesExpanded"
        @click="categoriesExpanded = !categoriesExpanded"
      >
        更多
      </button>
    </section>

    <!-- 标签云 -->
    <section v-if="tags.length" aria-labelledby="sidebar-tags-title">
      <p id="sidebar-tags-title" class="text-xs font-bold text-[var(--blog-ink)]">标签云</p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <NuxtLink
          v-for="tag in visibleTags"
          :key="tag.id"
          :to="`/tags/${tag.slug}`"
          exact
          :class="[
            'rounded-full border border-[var(--blog-border)] px-3 py-1.5 text-sm transition-colors hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]',
            isActiveLink(`/tags/${tag.slug}`)
              ? 'border-[var(--blog-accent)] bg-[var(--blog-accent)]/8 text-[var(--blog-accent)] font-semibold'
              : tagClass(tag.count)
          ]"
          :title="`${tag.name}: ${tag.count} 篇`"
        >
          {{ tag.name }}
        </NuxtLink>
      </div>
      <button
        v-if="tags.length > TAG_LIMIT"
        class="mt-3 text-xs text-[var(--blog-subtle)] transition-colors hover:text-[var(--blog-accent)]"
        type="button"
        :aria-expanded="tagsExpanded"
        @click="tagsExpanded = !tagsExpanded"
      >
        更多
      </button>
    </section>
  </div>
</template>
