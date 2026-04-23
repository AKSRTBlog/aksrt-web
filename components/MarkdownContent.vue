<script setup lang="ts">
import { renderMarkdown } from '~/composables/api';

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

  const blocks = rootRef.value.querySelectorAll('pre');
  for (const block of blocks) {
    if (block.dataset.copyEnhanced === 'true') {
      continue;
    }

    const code = block.querySelector('code');
    if (!code) {
      continue;
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'markdown-copy-button';
    button.textContent = '复制代码';
    button.setAttribute('aria-label', '复制代码块');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        button.textContent = '已复制';
        window.setTimeout(() => {
          button.textContent = '复制代码';
        }, 1200);
      } catch {
        button.textContent = '复制失败';
        window.setTimeout(() => {
          button.textContent = '复制代码';
        }, 1200);
      }
    });

    block.appendChild(button);
    block.dataset.copyEnhanced = 'true';
  }
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
