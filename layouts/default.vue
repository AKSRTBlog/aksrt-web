<script setup lang="ts">
import { fetchPublicSiteSettings } from '~/composables/api';

const { data: siteSettings } = await useAsyncData('site-settings', fetchPublicSiteSettings);

provide('site-settings', siteSettings);

useHead(() => {
  const settings = siteSettings.value;
  const siteTitle = settings?.siteTitle || 'Blog';
  const seoDesc = settings?.siteDescription || settings?.seo?.description || '';
  const canonicalUrl = settings?.seo?.canonicalUrl || '';
  const logoUrl = settings?.logoUrl || '';
  const defaultOgImage = logoUrl
    ? logoUrl
    : '';

  return {
    titleTemplate: (titleChunk?: string) => {
      if (!titleChunk || titleChunk.trim() === siteTitle.trim()) {
        return siteTitle;
      }
      return titleChunk ? `${titleChunk} | ${siteTitle}` : siteTitle;
    },
    meta: [
      // 基本 SEO
      { name: 'description', content: seoDesc },
      { name: 'keywords', content: settings?.seo.keywords || '' },
      // Open Graph - 社交媒体分享（微信、微博、Twitter 等）
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: seoDesc },
      { property: 'og:type', content: 'website' },
      ...(canonicalUrl ? [{ property: 'og:url', content: canonicalUrl }] : []),
      ...(defaultOgImage ? [{ property: 'og:image', content: defaultOgImage }] : []),
      { property: 'og:site_name', content: siteTitle },
      { property: 'og:locale', content: 'zh_CN' },
    ],
    link: canonicalUrl ? [{ rel: 'canonical', href: canonicalUrl }] : [],
  };
});
</script>

<template>
  <div class="blog-shell min-h-screen bg-[var(--blog-bg)] text-[var(--blog-ink)]">
    <div class="mx-auto flex min-h-screen max-w-[1440px] gap-4 px-4 py-4 lg:gap-6 lg:px-6">
      <SiteSidebar :site-settings="siteSettings || undefined" />
      <div class="min-w-0 flex-1">
        <SiteHeader :site-settings="siteSettings || undefined" />
        <main class="pt-4 lg:pt-0">
          <slot />
        </main>
      </div>
    </div>
    <SiteFooter :site-settings="siteSettings || undefined" />
  </div>
</template>
