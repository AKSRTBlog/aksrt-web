<script setup lang="ts">
import { fetchAllPublicArticles, filterArticles } from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

const route = useRoute();
const keyword = computed(() => typeof route.query.q === 'string' ? route.query.q : '');

// 纯客户端 AJAX 加载
const articles = ref<BlogArticleSummary[]>([]);
const loading = ref(true);
const error = ref('');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchAllPublicArticles();
    articles.value = data ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load articles.';
    articles.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});

const results = computed(() => filterArticles(articles.value, { keyword: keyword.value }));

useSeoMeta({
  title: () => keyword.value ? `Search: ${keyword.value}` : 'Search',
  description: () => keyword.value ? `Search results for ${keyword.value}.` : 'Search the article archive.',
  robots: 'noindex,follow',
});
</script>

<template>
  <div>
    <PageHero
      centered
      eyebrow="Search"
      title="Search the archive"
      description="Find articles by title, category, tag, or keyword."
    />

    <section class="mx-auto max-w-6xl px-6 pb-20">
      <SearchForm :initial-value="keyword" class-name="mx-auto max-w-3xl" />

      <div class="mt-8">
        <!-- 加载骨架屏 -->
        <div v-if="loading && keyword" class="space-y-0 overflow-hidden rounded-none border border-[var(--blog-border)] bg-white/88 sm:rounded-[4px]">
          <div v-for="i in 4" :key="i" class="flex items-stretch gap-3 border-b border-[var(--blog-border)] px-4 py-5 last:border-b-0 sm:px-6">
            <div class="min-w-0 flex-1 space-y-3">
              <div class="animate-pulse h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
              <div class="animate-pulse h-3 w-full rounded bg-[var(--blog-soft)]" />
              <div class="animate-pulse h-3 w-2/3 rounded bg-[var(--blog-soft)]" />
            </div>
            <div class="animate-pulse h-[104px] w-36 shrink-0 rounded-[3px] bg-[var(--blog-soft)] md:w-64" />
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="blog-panel flex flex-col items-center gap-3 px-8 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
          <button class="blog-button-secondary text-sm" @click="loadData">Retry</button>
        </div>

        <!-- 等待输入 -->
        <EmptyState
          v-else-if="!keyword && !error"
          title="Start with a keyword"
          description="Search the full article archive by entering a word, topic, or tag."
        />

        <!-- 无结果 -->
        <EmptyState
          v-else-if="results.length === 0"
          title="No search results"
          description="Try a shorter keyword or browse the archive for nearby topics."
          action-label="Browse archive"
          action-href="/archive"
        />

        <!-- 搜索结果列表 -->
        <ArticleFeed v-else :articles="results" view="list" />
      </div>
    </section>
  </div>
</template>
