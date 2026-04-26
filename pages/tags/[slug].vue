<script setup lang="ts">
import { deriveTags, fetchAllPublicArticles, filterArticles } from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

// 纯客户端 AJAX 加载
const articles = ref<BlogArticleSummary[]>([]);
const loading = ref(true);
const error = ref('');
const notFound = ref(false);

async function loadData() {
  loading.value = true;
  error.value = '';
  notFound.value = false;
  try {
    const data = await fetchAllPublicArticles();
    articles.value = data ?? [];

    // 客户端检查标签是否存在
    const derivedTags = deriveTags(articles.value);
    const exists = derivedTags.some((t) => t.slug === slug.value);
    if (!exists && slug.value) {
      notFound.value = true;
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load articles.';
    articles.value = [];
  } finally {
    loading.value = false;
  }
}

usePublicLiveReload(loadData);

onMounted(() => {
  loadData();
});

const tags = computed(() => deriveTags(articles.value));
const tag = computed(() => tags.value.find((item) => item.slug === slug.value) || null);
const result = computed(() => filterArticles(articles.value, { tag: slug.value }));

useSeoMeta({
  title: () => tag.value ? `Tag: ${tag.value.name}` : 'Tag',
  description: () => tag.value ? `Articles tagged with ${tag.value.name}.` : 'Tag archive.',
});
</script>

<template>
  <div>
    <!-- 404 状态 -->
    <template v-if="notFound && !loading">
      <section class="mx-auto max-w-6xl px-6 py-20">
        <EmptyState
          title="Tag not found"
          :description="`The tag '#${slug}' does not exist.`"
          action-label="Browse articles"
          action-href="/articles"
        />
      </section>
    </template>

    <!-- 标签页正常内容 -->
    <template v-else>
      <!-- 加载骨架屏 -->
      <template v-if="loading">
        <section class="mx-auto max-w-6xl px-6 py-10">
          <div v-for="i in 4" :key="i" class="animate-pulse flex items-center gap-3 rounded-[4px] border border-[var(--blog-border)] px-4 py-4 mb-4">
            <div class="h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
            <div class="h-3 w-12 rounded bg-[var(--blog-soft)]" />
          </div>
        </section>
      </template>

      <template v-else-if="error">
        <section class="mx-auto max-w-6xl px-6 py-10">
          <div class="blog-panel flex flex-col items-center gap-3 py-12 text-center">
            <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
            <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
            <button class="blog-button-secondary text-sm" @click="loadData">Retry</button>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="mx-auto max-w-6xl px-6 py-10">
          <EmptyState
            v-if="result.length === 0"
            title="No articles use this tag yet"
            description="The tag exists, but it is not attached to any published article right now."
            action-label="Back to articles"
            action-href="/articles"
          />
          <ArticleFeed v-else :articles="result" view="grid" />
        </section>
      </template>
    </template>
  </div>
</template>
