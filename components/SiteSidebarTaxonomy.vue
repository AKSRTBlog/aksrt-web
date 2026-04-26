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
  // 高权重：蓝底蓝字
  if (weight >= 0.75) return 'border border-[var(--blog-accent)] bg-[var(--blog-accent)]/8 text-[var(--blog-accent)] font-semibold';
  // 中权重：灰底墨字
  if (weight >= 0.45) return 'bg-gray-100 text-[var(--blog-ink)]';
  // 低权重：透明墨字
  return 'text-[var(--blog-muted)] hover:bg-gray-100';
}
</script>

<template>
  <div v-if="pending" class="space-y-6 animate-pulse px-4 py-5">
    <!-- 分类骨架 -->
    <div class="space-y-2">
      <div v-for="i in 6" :key="'cs-'+i" class="h-8 rounded-xl bg-[var(--blog-soft)]" />
    </div>
    <!-- 标签骨架 -->
    <div class="flex flex-wrap gap-1.5">
      <div v-for="i in 8" :key="'ts-'+i" class="h-7 w-16 rounded-full bg-[var(--blog-soft)]" />
    </div>
  </div>

  <div v-else-if="categories.length || tags.length" class="space-y-6 px-4 py-5">
    <!-- ======== 分类列表 ======== -->
    <section v-if="categories.length">
      <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--blog-ink)]">分类</p>
      <div class="space-y-0.5">
        <NuxtLink
          v-for="c in visibleCategories" :key="c.id"
          :to="`/categories/${c.slug}`"
          exact
          exact-active-class="
            bg-[var(--blog-accent)]/8
            text-[var(--blog-accent)]
            font-semibold
            shadow-sm
          "
          class="
            flex items-center justify-between
            rounded-xl px-3 py-1.5
            text-sm
            transition-all duration-150
            hover:bg-[var(--blog-soft)]
            hover:text-[var(--blog-ink)]
          "
        >
          <span class="truncate">{{ c.name }}</span>
          <span class="shrink-0 ml-3 rounded-full bg-[var(--blog-soft)] px-2 py-0.5 text-[10px] tabular-nums text-[var(--blog-subtle)]">{{ c.count }}</span>
        </NuxtLink>
      </div>
      <button
        v-if="categories.length > CATEGORY_LIMIT"
        type="button"
        class="mt-1.5 text-[11px] font-medium text-[var(--blog-subtle)] transition-colors hover:text-[var(--blog-accent)]"
        @click="categoriesExpanded = !categoriesExpanded"
      >{{ categoriesExpanded ? '收起' : `更多 ${categories.length - CATEGORY_LIMIT} 个` }}</button>
    </section>

    <!-- ======== 标签云 ======== -->
    <section v-if="tags.length" class="mt-2">
      <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--blog-ink)]">标签云</p>
      <div class="flex flex-wrap gap-1.5">
        <NuxtLink
          v-for="t in visibleTags" :key="t.id"
          :to="`/tags/${t.slug}`"
          exact
          exact-active-class="
            bg-[var(--blog-accent)]
            text-white
            font-semibold
            shadow-sm
          "
          class="
            rounded-full border border-[var(--blog-border)]/50
            bg-gray-100
            px-3 py-1
            text-sm
            transition-all duration-150
            hover:border-[var(--blog-accent)]/50
            hover:bg-[var(--blog-accent)]/5
          "
          :title="`${t.name}: ${t.count} 篇`"
        >{{ t.name }}</NuxtLink>
      </div>
      <button
        v-if="tags.length > TAG_LIMIT"
        type="button"
        class="mt-2 text-[11px] font-medium text-[var(--blog-subtle)] transition-colors hover:text-[var(--blog-accent)]"
        @click="tagsExpanded = !tagsExpanded"
      >{{ tagsExpanded ? '收起' : `更多 ${tags.length - TAG_LIMIT} 个` }}</button>
    </section>
  </div>
</template>
