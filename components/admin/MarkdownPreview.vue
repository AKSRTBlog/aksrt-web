<script setup lang="ts">
import { renderMarkdown } from '~/composables/api'

const props = defineProps<{
  value?: string
  class?: string
}>()

const renderedHtml = computed(() => renderMarkdown(props.value ?? ''))
</script>

<template>
  <div
    :class="['prose-config', props.class]"
    v-html="renderedHtml"
  />
</template>

<style scoped>
.prose-config {
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.75;
  color: #374151;
}

.prose-config :deep(h1) {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.prose-config :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose-config :deep(h3) {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.prose-config :deep(h4),
.prose-config :deep(h5),
.prose-config :deep(h6) {
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.prose-config :deep(p) {
  margin-bottom: 1rem;
}

.prose-config :deep(blockquote) {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #6b7280;
  font-style: italic;
}

.prose-config :deep(code) {
  background: #f5f5f5;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: ui-monospace, monospace;
}

.prose-config :deep(pre code) {
  background: transparent;
  padding: 0;
}

.prose-config :deep(ul),
.prose-config :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.prose-config :deep(li) {
  margin-bottom: 0.25rem;
}

.prose-config :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.prose-config :deep(a:hover) {
  color: #1d4ed8;
}

.prose-config :deep(img) {
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.prose-config :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 2rem 0;
}

.prose-config :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.prose-config :deep(th),
.prose-config :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.prose-config :deep(th) {
  background: #f9fafb;
  font-weight: 600;
}
</style>
