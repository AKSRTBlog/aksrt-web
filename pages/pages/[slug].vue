<script setup lang="ts">
import { fetchPublicStandalonePage } from '~/composables/api';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

const { data: page } = await useAsyncData(() => `standalone-${slug.value}`, () => fetchPublicStandalonePage(slug.value));

const readingTime = computed(() => estimateReadingTime(page.value?.content || ''));
const canonicalUrl = computed(() => {
  const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, '') || '';
  return page.value && base ? `${base}/pages/${page.value.slug}` : '';
});

useSeoMeta({
  title: () => page.value?.title || 'Page',
  description: () => page.value?.summary || siteSettings.value?.siteDescription || '',
});

useHead(() => ({
  link: canonicalUrl.value
    ? [
        {
          rel: 'canonical',
          href: canonicalUrl.value,
        },
      ]
    : [],
}));
</script>

<template>
  <div v-if="page" class="pb-20">
    <section class="mx-auto max-w-7xl px-0 pt-4 sm:px-6">
      <div class="blog-panel overflow-hidden rounded-none sm:rounded-[4px]">
        <div class="p-6 md:p-8 lg:p-10">
          <div class="flex flex-wrap items-center gap-2 text-sm text-[var(--blog-muted)]">
            <NuxtLink class="text-[var(--blog-accent)] transition hover:underline" to="/">Home</NuxtLink>
            <span>/</span>
            <span class="text-[var(--blog-ink)]">{{ page.title }}</span>
          </div>

          <div class="mt-8 max-w-4xl">
            <h1 class="text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--blog-ink)] md:text-6xl">{{ page.title }}</h1>
            <p v-if="page.summary" class="mt-6 max-w-3xl text-base leading-8 text-[var(--blog-muted)] md:text-lg">{{ page.summary }}</p>

            <ul class="mt-8 flex flex-wrap gap-4 text-sm text-[var(--blog-muted)]">
              <li>Path: /pages/{{ page.slug }}</li>
              <li>Reading time: {{ readingTime }} min</li>
            </ul>
          </div>
        </div>

        <div class="border-t border-[var(--blog-border)]">
          <MarkdownContent :content="page.content" :copy-code-blocks="true" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-0 pt-8 sm:px-6">
      <div class="blog-panel rounded-none px-6 py-6 sm:rounded-[4px] md:px-10 md:py-8">
        <NuxtLink class="inline-flex items-center gap-2 text-base font-medium text-[var(--blog-accent)] transition hover:underline" to="/">
          Back home
        </NuxtLink>
      </div>
    </section>
  </div>

  <section v-else class="mx-auto max-w-4xl px-6 py-16">
    <EmptyState
      title="Page not found"
      description="The requested standalone page is unavailable."
      action-label="Back home"
      action-href="/"
    />
  </section>
</template>
