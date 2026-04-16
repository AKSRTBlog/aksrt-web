<script setup lang="ts">
import { fetchAllPublicArticles, fetchPublicCategories, filterArticles, mergeCategories } from '~/composables/api';

const route = useRoute();

const [{ data: articles }, { data: publicCategories }] = await Promise.all([
  useAsyncData('shared-all-articles', fetchAllPublicArticles),
  useAsyncData('articles-categories', fetchPublicCategories),
]);

const keyword = computed(() => typeof route.query.q === 'string' ? route.query.q : '');
const category = computed(() => typeof route.query.category === 'string' ? route.query.category : '');
const tag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : '');
const sort = computed<'latest' | 'popular' | 'reading'>(() => {
  return route.query.sort === 'reading' || route.query.sort === 'popular' ? route.query.sort : 'latest';
});
const view = computed<'grid' | 'list'>(() => (route.query.view === 'grid' ? 'grid' : 'list'));

const filteredArticles = computed(() => filterArticles(articles.value || [], {
  keyword: keyword.value,
  category: category.value || undefined,
  tag: tag.value || undefined,
  sort: sort.value,
}));

const categories = computed(() => mergeCategories(publicCategories.value || [], articles.value || []));
const tags = computed(() => {
  const map = new Map<string, { id: string; name: string; slug: string; count: number }>();

  for (const article of articles.value || []) {
    for (const item of article.tags) {
      const current = map.get(item.slug);
      map.set(item.slug, {
        id: item.id,
        name: item.name,
        slug: item.slug,
        count: (current?.count || 0) + 1,
      });
    }
  }

  return [...map.values()].sort((left, right) => right.count - left.count);
});

function updateQuery(patch: Record<string, string>) {
  const merged = { ...route.query, ...patch };
  const nextQuery: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(merged)) {
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof value === 'string' && value.trim()) {
      nextQuery[key] = value.trim();
    }
  }

  return navigateTo({
    path: '/articles',
    query: nextQuery,
  });
}

useSeoMeta({
  title: 'Articles',
  description: 'Browse articles by topic, tag, or keyword.',
});
</script>

<template>
  <div class="-mx-4 sm:mx-0">
    <section class="mx-auto max-w-6xl px-0 pb-20 sm:px-6">
      <div class="space-y-6">
        <div class="blog-panel p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-1 items-center gap-3 rounded-[4px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3">
              <span class="text-[var(--blog-muted)]">Q</span>
              <input
                :value="keyword"
                class="w-full bg-transparent text-sm text-[var(--blog-ink)] outline-none placeholder:text-[var(--blog-subtle)]"
                placeholder="Search articles"
                @input="updateQuery({ q: ($event.target as HTMLInputElement).value })"
              >
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <select class="blog-select" :value="sort" @change="updateQuery({ sort: ($event.target as HTMLSelectElement).value })">
                <option value="latest">Latest</option>
                <option value="reading">Reading time</option>
                <option value="popular">Popular</option>
              </select>

              <div class="flex items-center gap-1 rounded-full border border-[var(--blog-border)] bg-[var(--blog-soft)] p-1">
                <button class="blog-toggle" :class="view === 'grid' ? 'blog-toggle-active' : 'blog-toggle'" type="button" @click="updateQuery({ view: 'grid' })">G</button>
                <button class="blog-toggle" :class="view === 'list' ? 'blog-toggle-active' : 'blog-toggle'" type="button" @click="updateQuery({ view: 'list' })">L</button>
              </div>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-subtle)]">Categories</p>
              <div class="flex flex-wrap gap-2">
                <button class="blog-filter" :class="!category ? 'blog-filter-active' : 'blog-filter'" type="button" @click="updateQuery({ category: '' })">All</button>
                <button
                  v-for="item in categories"
                  :key="item.id"
                  class="blog-filter"
                  :class="category === item.slug ? 'blog-filter-active' : 'blog-filter'"
                  type="button"
                  @click="updateQuery({ category: item.slug })"
                >
                  {{ item.name }}
                </button>
              </div>
            </div>

            <div>
              <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-subtle)]">Tags</p>
              <div class="flex flex-wrap gap-2">
                <button class="blog-filter" :class="!tag ? 'blog-filter-active' : 'blog-filter'" type="button" @click="updateQuery({ tag: '' })">All</button>
                <button
                  v-for="item in tags.slice(0, 10)"
                  :key="item.id"
                  class="blog-filter"
                  :class="tag === item.slug ? 'blog-filter-active' : 'blog-filter'"
                  type="button"
                  @click="updateQuery({ tag: item.slug })"
                >
                  #{{ item.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 px-0 sm:px-1">
          <p class="text-sm text-[var(--blog-muted)]">{{ filteredArticles.length }} articles</p>
          <NuxtLink class="text-sm font-medium text-[var(--blog-accent)]" to="/search">Search</NuxtLink>
        </div>

        <EmptyState
          v-if="filteredArticles.length === 0"
          title="No matching articles"
          description="Try a different keyword, category, or tag, or browse the archive instead."
          action-label="Browse archive"
          action-href="/archive"
        />
        <ArticleFeed v-else :articles="filteredArticles" :view="view" />
      </div>
    </section>
  </div>
</template>
