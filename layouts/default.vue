<script setup lang="ts">
import { fetchPublicSiteSettings } from '~/composables/api';

const { data: siteSettings } = await useAsyncData('site-settings', fetchPublicSiteSettings);

provide('site-settings', siteSettings);

useHead(() => {
  const settings = siteSettings.value;

  if (!settings) {
    return {
      title: 'AKSRT Blog',
    };
  }

  return {
    titleTemplate: (titleChunk?: string) => titleChunk ? `${titleChunk} | ${settings.siteTitle}` : settings.siteTitle,
    meta: [
      {
        name: 'description',
        content: settings.seo.description || settings.siteDescription,
      },
      {
        name: 'keywords',
        content: settings.seo.keywords,
      },
    ],
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
