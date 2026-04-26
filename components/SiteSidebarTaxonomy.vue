<script setup lang="ts">
import {
  deriveTags,
  fetchAllPublicArticles,
  fetchPublicCategories,
  mergeCategories,
} from '~/composables/api';

const CATEGORY_LIMIT = 6;
const TAG_LIMIT = 14;

const route = useRoute();
const currentPath = computed(() => route.path);
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
  default: () => ({ articles: [], publicCategories: [] }),
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

function isHotCategory(count: number) { return count >= maxCategoryCount.value; }
function isActiveLink(url: string) { return currentPath.value === url; }

function tagWeight(count: number) {
  if (maxTagCount.value <= 1) return 0;
  return Math.min(1, count / maxTagCount.value);
}

function tagClass(count: number) {
  const weight = tagWeight(count);
  if (weight >= 0.75) return 'border border-blue-600 bg-blue-50 text-blue-600';
  if (weight >= 0.45) return 'bg-gray-100 text-[var(--blog-ink)]';
  return 'text-[var(--blog-muted)]';
}
</script>

<template>
  <div v-if="pending" class="space-y-7">
    <div class="space-y-3">
      <div class="h-3.5 w-14 animate-pulse rounded-md bg-[var(--blog-soft)]" />
      <div class="space-y-2">
        <div v-for="i in 4" :key="'cat-'+i" class="h-8 animate-pulse rounded-lg bg-[var(--blog-soft)]" />
      </div>
    </div>
    <div class="space-y-3">
      <div class="h-3.5 w-12 animate-pulse rounded-md bg-[var(--blog-soft)]" />
      <div class="flex flex-wrap gap-1.5">
        <div v-for="i in 8" :key="'tag-'+i" class="h-7 w-16 animate-pulse rounded-full bg-[var(--blog-soft)]" />
      </div>
    </div>
  </div>

  <div v-else-if="categories.length || tags.length" class="space-y-7">
    <!-- 分类列表 -->
    <section v-if="categories.length">
      <p class="text-xs font-bold text-[var(--blog-ink)]">分类</p>
      <div class="mt-3 space-y-0.5">
        <NuxtLink
          v-for="c in visibleCategories" :key="c.id"
          :to="`/categories/${c.slug}`"
          exact-active-class="bg-blue-50 text-blue-600 font-semibold"
          class="flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors hover:bg-blue-50"
        >
          <span class="truncate" :class="isActiveLink(`/categories/${c.slug}`) ? 'font-semibold text-[var(--blog-ink)]' : 'text-[var(--blog-muted)]'">{{ c.name }}</span>
          <span class="shrink-0 ml-3 tabular-nums text-xs text-[var(--blog-subtle)]">{{ c.count }}</span>
        </NuxtLink>
      </div>
      <button v-if="categories.length > CATEGORY_LIMIT" type="button"
        class="mt-1 text-xs text-[var(--blog-subtle)] hover:text-blue-600"
        @click="categoriesExpanded = !categoriesExpanded">更多</button>
    </section>

    <!-- 标签云 -->
    <section v-if="tags.length">
      <p class="text-xs font-bold text-[var(--blog-ink)]">标签云</p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <NuxtLink
          v-for="t in visibleTags" :key="t.id"
          :to="`/tags/${t.slug}`"
          exact-active-class="border-blue-600 bg-blue-600 text-white font-semibold"
          class="rounded-full border border-[var(--blog-border)] bg-gray-100 px-3 py-1.5 text-sm transition-colors hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"
          :title="`${t.name}: ${t.count} 篇`"
        >{{ t.name }}</NuxtLink>
      </div>
      <button v-if="tags.length > TAG_LIMIT" type="button"
        class="mt-3 text-xs text-[var(--blog-subtle)] hover:text-blue-600"
        @click="tagsExpanded = !tagsExpanded">更多</button>
    </section>
  </div>
</template>
