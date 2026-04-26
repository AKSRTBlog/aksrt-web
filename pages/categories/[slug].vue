<script setup lang="ts">
import { fetchAllPublicArticles, fetchPublicCategories, filterArticles } from '~/composables/api';

const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));

const { data: categories } = await useAsyncData('category-categories', fetchPublicCategories);
const { data: articles } = useAsyncData('shared-all-articles', fetchAllPublicArticles, { lazy: true });

const category = computed(() => (categories.value || []).find((item) => item.slug === slug.value) || null);
const result = computed(() => filterArticles(articles.value || [], { category: slug.value }));

if (import.meta.server && categories.value && !category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' });
}

watchEffect(() => {
  if (import.meta.client && categories.value && !category.value) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' });
  }
});

useSeoMeta({
  title: () => category.value ? `Category: ${category.value.name}` : 'Category',
  description: () => category.value ? `Articles filed under ${category.value.name}.` : 'Category archive.',
});
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <EmptyState
        v-if="category && result.length === 0"
        title="No articles in this category yet"
        description="This category exists, but there are no published articles inside it right now."
        action-label="Back to articles"
        action-href="/articles"
      />
      <ArticleFeed v-else-if="category" :articles="result" view="list" />
    </section>
  </div>
</template>
