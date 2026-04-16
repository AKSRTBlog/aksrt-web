<script setup lang="ts">
import { renderMarkdown } from '~/composables/api';

const props = defineProps<{
  content: string;
}>();

const html = computed(() => renderMarkdown(props.content));
</script>

<template>
  <div class="article-content px-6 py-8 md:px-10 md:py-12" v-html="html" />
</template>
