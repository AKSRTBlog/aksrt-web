<script setup lang="ts">
defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  action: [action: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bold' | 'italic' | 'quote' | 'code' | 'list' | 'link' | 'table' | 'image']
  imageUpload: []
  externalImageInsert: []
}>()

const actions = [
  { id: 'h1', title: '一级标题', icon: 'H1' },
  { id: 'h2', title: '二级标题', icon: 'H2' },
  { id: 'h3', title: '三级标题', icon: 'H3' },
  { id: 'bold', title: '加粗', icon: 'B' },
  { id: 'italic', title: '斜体', icon: 'I' },
  { id: 'quote', title: '引用', icon: '"' },
  { id: 'code', title: '代码', icon: '<>' },
  { id: 'list', title: '列表', icon: '•' },
  { id: 'link', title: '链接', icon: '🔗' },
  { id: 'table', title: '表格', icon: '⊞' },
] as const

function handleAction(action: typeof actions[number]['id']) {
  emit('action', action)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <button
      v-for="action in actions"
      :key="action.id"
      :disabled="disabled"
      :title="action.title"
      class="flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      @click="handleAction(action.id)"
    >
      {{ action.icon }}
    </button>

    <div class="mx-2 h-5 w-px bg-slate-200" />

    <button
      :disabled="disabled"
      class="flex h-8 items-center gap-1.5 rounded px-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      title="从媒体库选择图片"
      type="button"
      @click="emit('imageUpload')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      图片
    </button>

    <button
      :disabled="disabled"
      class="flex h-8 items-center gap-1.5 rounded px-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
      title="插入外链图片"
      type="button"
      @click="emit('externalImageInsert')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      外链
    </button>
  </div>
</template>
