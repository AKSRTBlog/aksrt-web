<script setup lang="ts">
import {
  fetchAllPublicArticles,
  fetchPublicCategories,
  filterArticles,
  mergeCategories,
} from '~/composables/api';
import type { BlogArticleSummary, PublicArticleCategoryItem } from '~/types/blog';

const route = useRoute();
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

const articles = ref<BlogArticleSummary[]>([]);
const publicCategories = ref<PublicArticleCategoryItem[]>([]);
const loading = ref(true);
const error = ref('');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [articleResult, categoryResult] = await Promise.all([
      fetchAllPublicArticles(),
      fetchPublicCategories(),
    ]);
    articles.value = articleResult ?? [];
    publicCategories.value = categoryResult ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed load articles.';
    articles.value = [];
    publicCategories.value = [];
  } finally {
    loading.value = false;
  }
}

usePublicLiveReload(loadData);

onMounted(() => {
  loadData();
});

const keyword = computed(() => typeof route.query.q === 'string' ? route.query.q : '');
const category = computed(() => typeof route.query.category === 'string' ? route.query.category : '');
const tag = computed(() => typeof route.query.tag === 'string' ? route.query.tag : '');
const sort = computed<'latest' | 'oldest' | 'title'>(() => {
  return route.query.sort === 'oldest' || route.query.sort === 'title' ? route.query.sort : 'latest';
});
const view: 'list' = 'list';

const filteredArticles = computed(() =>
  filterArticles(articles.value, {
    keyword: keyword.value,
    category: category.value || undefined,
    tag: tag.value || undefined,
    sort: sort.value,
  }),
);

const categories = computed(() => mergeCategories(publicCategories.value, articles.value));
const tags = computed(() => {
  const map = new Map<string, { id: string; name: string; slug: string; count: number }>();
  for (const article of articles.value) {
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
    if (key === 'view') {
      continue;
    }
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof value === 'string' && value.trim()) {
      nextQuery[key] = value.trim();
    }
  }
  return navigateTo({ path: '/articles', query: nextQuery });
}

useSeoMeta({
  title: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Articles',
  description: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
  ogTitle: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Articles',
  ogDescription: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
});

const articlesCanonicalUrl = computed(() => {
  const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, '') || '';
  return base ? `${base}/articles` : '';
});

useHead(() => ({
  link: articlesCanonicalUrl.value
    ? [
        {
          rel: 'canonical',
          href: articlesCanonicalUrl.value,
        },
      ]
    : [],
  meta: articlesCanonicalUrl.value
    ? [
        {
          property: 'og:url',
          content: articlesCanonicalUrl.value,
        },
      ]
    : [],
}));
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
                <option value="oldest">Oldest</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>
          </div>

          <template v-if="loading">
            <div class="mt-5 space-y-4">
              <div class="animate-pulse space-y-3">
                <div class="h-3 w-16 rounded bg-[var(--blog-soft)]" />
                <div class="flex gap-2">
                  <div v-for="i in 5" :key="'cat-' + i" class="h-7 w-20 rounded-full bg-[var(--blog-soft)]" />
                </div>
              </div>
              <div class="animate-pulse space-y-3">
                <div class="h-3 w-12 rounded bg-[var(--blog-soft)]" />
                <div class="flex gap-2">
                  <div v-for="i in 8" :key="'tag-' + i" class="h-7 w-16 rounded-full bg-[var(--blog-soft)]" />
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="mt-5 space-y-4">
              <div>
                <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-subtle)]">Categories</p>
                <div class="flex flex-wrap gap-2">
                  <button class="blog-filter" :class="!category ? 'blog-filter-active' : ''" type="button" @click="updateQuery({ category: '' })">All</button>
                  <button
                    v-for="item in categories"
                    :key="item.id"
                    class="blog-filter"
                    :class="category === item.slug ? 'blog-filter-active' : ''"
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
                  <button class="blog-filter" :class="!tag ? 'blog-filter-active' : ''" type="button" @click="updateQuery({ tag: '' })">All</button>
                  <button
                    v-for="item in tags.slice(0, 10)"
                    :key="item.id"
                    class="blog-filter"
                    :class="tag === item.slug ? 'blog-filter-active' : ''"
                    type="button"
                    @click="updateQuery({ tag: item.slug })"
                  >
                    #{{ item.name }}
                  </button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div v-if="loading" :class="view === 'grid' ? 'grid gap-6 md:grid-cols-2' : 'space-y-0 overflow-hidden rounded-none border border-[var(--blog-border)] bg-white/88 sm:rounded-[4px]'">
          <template v-if="view === 'grid'">
            <div v-for="i in 6" :key="i" class="animate-pulse blog-panel overflow-hidden">
              <div class="aspect-[4/3] bg-[var(--blog-soft)]" />
              <div class="p-6 space-y-3">
                <div class="h-3 w-20 rounded bg-[var(--blog-soft)]" />
                <div class="h-5 w-3/4 rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-full rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-2/3 rounded bg-[var(--blog-soft)]" />
              </div>
            </div>
          </template>
          <template v-else>
            <div v-for="i in 5" :key="i" class="flex items-stretch gap-3 border-b border-[var(--blog-border)] px-4 py-5 sm:px-6 last:border-b-0">
              <div class="min-w-0 flex-1 space-y-3">
                <div class="h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-full rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-2/3 rounded bg-[var(--blog-soft)]" />
              </div>
              <div class="h-[104px] w-36 shrink-0 rounded-[3px] bg-[var(--blog-soft)] md:w-64" />
            </div>
          </template>
        </div>

        <div v-else-if="error" class="blog-panel flex flex-col items-center gap-3 px-8 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
          <button class="blog-button-secondary text-sm" @click="loadData">Retry</button>
        </div>

        <EmptyState
          v-else-if="filteredArticles.length === 0"
          title="No matching articles"
          description="Try a different keyword, category, or tag, or browse the archive instead."
          action-label="Browse archive"
          action-href="/archive"
        />

        <TransitionGroup v-else name="list-fade" tag="div" appear>
          <ArticleFeed key="articles-loaded" :articles="filteredArticles" :view="view" />
        </TransitionGroup>
      </div>
    </section>
  </div>
</template>

<style scoped>
.list-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.list-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>
