<script setup lang="ts">
import { fetchPublicArticles, fetchPublicBanners, fetchPublicSiteSettings } from '~/composables/api';

const { data: siteSettingsData } = await useAsyncData('site-settings', fetchPublicSiteSettings);
const siteSettings = computed(() => siteSettingsData.value || null);

const [{ data: articleData }, { data: banners }] = await Promise.all([
  useAsyncData('home-articles', () => fetchPublicArticles({ page: 1, pageSize: 6 })),
  useAsyncData('home-banners', () => fetchPublicBanners('home_top')),
]);

// SEO 元数据
useSeoMeta({
  title: () => siteSettings.value?.seo?.title || 'Home',
  description: () => siteSettings.value?.seo?.description || siteSettings.value?.siteDescription || '',
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
        <ArticleFeed :articles="articleData?.list || []" view="list" />
      </div>
    </section>
  </div>
</template>
