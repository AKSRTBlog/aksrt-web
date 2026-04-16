<script setup lang="ts">
import { fetchAllPublicArticles, filterArticles } from '~/composables/api';

const route = useRoute();
const keyword = computed(() => typeof route.query.q === 'string' ? route.query.q : '');

const { data: articles, pending } = useAsyncData('shared-all-articles', fetchAllPublicArticles, { lazy: true });
const results = computed(() => filterArticles(articles.value || [], { keyword: keyword.value }));

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
        <EmptyState
          v-if="pending && keyword"
          title="Searching…"
          description="Looking for matching articles."
        />
        <EmptyState
          v-else-if="!keyword"
          title="Start with a keyword"
          description="Search the full article archive by entering a word, topic, or tag."
        />
        <EmptyState
          v-else-if="results.length === 0"
          title="No search results"
          description="Try a shorter keyword or browse the archive for nearby topics."
          action-label="Browse archive"
          action-href="/archive"
        />
        <ArticleFeed v-else :articles="results" view="list" />
      </div>
    </section>
  </div>
</template>
