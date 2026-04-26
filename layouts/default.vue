<script setup lang="ts">
import { fetchPublicSiteSettings } from '~/composables/api';

const { data: siteSettings } = await useAsyncData('site-settings', fetchPublicSiteSettings);

provide('site-settings', siteSettings);

/**
 * 将后台配置的 customHeadCode 注入到 <head> 中
 * 支持 <script>、<style>、<meta>、<link> 等任意 HTML 标签
 */
useHead(() => {
  const settings = siteSettings.value;
  const siteTitle = settings?.siteTitle || 'Blog';
  const seoDesc = settings?.siteDescription || settings?.seo?.description || '';
  const canonicalUrl = settings?.seo?.canonicalUrl || '';
  const logoUrl = settings?.logoUrl || '';
  const defaultOgImage = logoUrl ? logoUrl : '';

  return {
    titleTemplate: (titleChunk?: string) => {
      if (!titleChunk || titleChunk.trim() === siteTitle.trim()) {
        return siteTitle;
      }
      return titleChunk ? `${titleChunk} | ${siteTitle}` : siteTitle;
    },
    meta: [
      { name: 'description', content: seoDesc },
      { name: 'keywords', content: settings?.seo?.keywords || '' },
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

/**
 * 客户端挂载后，将 customHeadCode 中的标签追加到 <head>
 */
onMounted(() => {
  nextTick(() => {
    const code = siteSettings.value?.customHeadCode;
    if (!code) return;

    const temp = document.createElement('div');
    temp.innerHTML = code;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeType === 1) {
        // 对 <script> 标签特殊处理：需要重新创建才能执行
        if ((node as HTMLElement).tagName === 'SCRIPT') {
          const oldScript = node as HTMLScriptElement;
          const newScript = document.createElement('script');
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.textContent = oldScript.textContent;
          document.head.appendChild(newScript);
        } else {
          document.head.appendChild(node.cloneNode(true));
        }
      }
    });
  });
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
