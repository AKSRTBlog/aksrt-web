<script setup lang="ts">
import { renderMarkdown } from '~/composables/api';
import { enhanceMarkdownCodeBlocks } from '~/utils/markdown-code-blocks';

const props = defineProps<{
  content: string;
  copyCodeBlocks?: boolean;
}>();

const html = computed(() => renderMarkdown(props.content));
const rootRef = ref<HTMLElement | null>(null);

function enhanceCodeBlocks() {
  if (import.meta.server || !props.copyCodeBlocks || !rootRef.value) {
    return;
  }

  enhanceMarkdownCodeBlocks(rootRef.value);
}

watch(
  html,
  async () => {
    await nextTick();
    enhanceCodeBlocks();
  },
  { immediate: true },
);
</script>

<template>
  <div ref="rootRef" class="article-content px-6 py-8 md:px-10 md:py-12" v-html="html" />
</template>
