<script setup lang="ts">
import { deriveTags, fetchAllPublicArticles, filterArticles } from '~/composables/api';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

const { data: articles, pending } = useAsyncData('shared-all-articles', fetchAllPublicArticles, { lazy: true });

const tags = computed(() => deriveTags(articles.value || []));
const tag = computed(() => tags.value.find((item) => item.slug === slug.value) || null);
const result = computed(() => filterArticles(articles.value || [], { tag: slug.value }));

if (import.meta.server && articles.value && !tag.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tag not found' });
}

watchEffect(() => {
  if (import.meta.client && articles.value && !tag.value) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' });
  }
});

useSeoMeta({
  title: () => tag.value ? `Tag: ${tag.value.name}` : 'Tag',
  description: () => tag.value ? `Articles tagged with ${tag.value.name}.` : 'Tag archive.',
});
</script>

<template>
  <div>
    <PageHero
      v-if="tag"
      eyebrow="Tag"
      :title="`#${tag.name}`"
      description="Articles connected to this topic."
      stat-label="Articles"
      :stat-value="result.length"
    />

    <section class="mx-auto grid max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <EmptyState
          v-if="tag && result.length === 0"
          title="No articles use this tag yet"
          description="The tag exists, but it is not attached to any published article right now."
          action-label="Back to articles"
          action-href="/articles"
        />
        <ArticleFeed v-else-if="tag" :articles="result" view="grid" />
      </div>

      <SiteSidebar :site-settings="siteSettings || undefined" />
    </section>
  </div>
</template>
