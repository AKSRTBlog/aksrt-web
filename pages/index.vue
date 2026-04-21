<script setup lang="ts">
import { fetchPublicArticles, fetchPublicBanners } from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

// Banner 仍用 SSR（轻量，首屏展示需要）
const { data: banners } = await useAsyncData('home-banners', () => fetchPublicBanners('home_top'));

// 文章列表改为纯客户端 AJAX 加载
const articles = ref<BlogArticleSummary[]>([]);
const articlesLoading = ref(true);
const articlesError = ref('');

async function loadArticles() {
  articlesLoading.value = true;
  articlesError.value = '';
  try {
    const result = await fetchPublicArticles({ page: 1, pageSize: 6 });
    articles.value = result?.list ?? [];
  } catch (e) {
    articlesError.value = e instanceof Error ? e.message : 'Failed to load articles.';
    articles.value = [];
  } finally {
    articlesLoading.value = false;
  }
}

usePublicLiveReload(loadArticles);

onMounted(() => {
  loadArticles();
});

// SEO 元数据
useSeoMeta({
  title: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Home',
  description: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
  ogTitle: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Home',
  ogDescription: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
});

useHead(() => ({
  link: siteSettings.value?.seo?.canonicalUrl
    ? [
        {
          rel: 'canonical',
          href: siteSettings.value.seo.canonicalUrl,
        },
      ]
    : [],
}));
</script>

<template>
  <div class="space-y-8">
    <section v-if="banners && banners.length > 0" class="mx-auto max-w-6xl px-2 pt-4 sm:px-6 lg:pt-0">
      <BannerShowcase :banners="banners.slice(0, 3)" />
    </section>

    <section class="mx-auto max-w-6xl px-0 pb-16 sm:px-6">
      <div class="mt-8">
        <!-- 骨架屏 -->
        <div v-if="articlesLoading" class="space-y-4 md:grid md:gap-6 md:grid-cols-2">
          <div v-for="i in 4" :key="i" class="animate-pulse rounded-[4px] border border-[var(--blog-border)] bg-white/88 p-0 sm:rounded-[4px]">
            <div class="flex items-stretch gap-3 py-5 px-6">
              <div class="min-w-0 flex-1 space-y-3">
                <div class="h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-full rounded bg-[var(--blog-soft)]" />
                <div class="h-3 w-2/3 rounded bg-[var(--blog-soft)]" />
              </div>
              <div class="h-[104px] w-36 shrink-0 rounded-[3px] bg-[var(--blog-soft)] md:w-64" />
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="articlesError" class="blog-panel flex flex-col items-center gap-3 px-8 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ articlesError }}</p>
          <button class="blog-button-secondary text-sm" @click="loadArticles">Retry</button>
        </div>

        <!-- 正常列表 -->
        <template v-else>
          <ArticleFeed :articles="articles" view="list" />
        </template>
      </div>
    </section>
  </div>
</template>
