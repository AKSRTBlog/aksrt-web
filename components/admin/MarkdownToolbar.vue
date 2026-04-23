<script setup lang="ts">
type ToolbarAction =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bold'
  | 'italic'
  | 'quote'
  | 'inlineCode'
  | 'codeBlock'
  | 'unorderedList'
  | 'orderedList'
  | 'link'
  | 'table'

defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  action: [action: ToolbarAction]
  imageUpload: []
  externalImageInsert: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const headingMenuOpen = ref(false)

const headingActions = [
  { id: 'h1', label: 'H1 Heading', scale: 'text-3xl font-bold tracking-tight', size: '32px' },
  { id: 'h2', label: 'H2 Heading', scale: 'text-2xl font-bold tracking-tight', size: '28px' },
  { id: 'h3', label: 'H3 Heading', scale: 'text-xl font-semibold', size: '24px' },
  { id: 'h4', label: 'H4 Heading', scale: 'text-lg font-semibold', size: '20px' },
  { id: 'h5', label: 'H5 Heading', scale: 'text-base font-medium', size: '16px' },
  { id: 'h6', label: 'H6 Heading', scale: 'text-sm font-medium uppercase tracking-wide', size: '14px' },
] as const

const quickActions = [
  { id: 'bold', title: 'Bold', icon: 'B' },
  { id: 'italic', title: 'Italic', icon: 'I' },
  { id: 'quote', title: 'Quote', icon: '"' },
  { id: 'inlineCode', title: 'Inline Code', icon: '`' },
  { id: 'codeBlock', title: 'Code Block', icon: '</>' },
  { id: 'unorderedList', title: 'Unordered List', icon: '• List' },
  { id: 'orderedList', title: 'Ordered List', icon: '1. List' },
  { id: 'link', title: 'Link', icon: 'Link' },
  { id: 'table', title: 'Table', icon: 'Table' },
] as const

function handleToolbarAction(action: ToolbarAction) {
  emit('action', action)
}

function toggleHeadingMenu() {
  headingMenuOpen.value = !headingMenuOpen.value
}

function closeHeadingMenu() {
  headingMenuOpen.value = false
}

function selectHeading(action: (typeof headingActions)[number]['id']) {
  emit('action', action)
  closeHeadingMenu()
}

function handleGlobalPointerDown(event: PointerEvent) {
  if (!headingMenuOpen.value || !rootRef.value) {
    return
  }

  const target = event.target as Node | null
  if (!target || rootRef.value.contains(target)) {
    return
  }

  closeHeadingMenu()
}

onMounted(() => {
  window.addEventListener('pointerdown', handleGlobalPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handleGlobalPointerDown)
})
</script>

<template>
  <div ref="rootRef" class="flex flex-wrap items-center gap-1">
    <div class="relative">
      <button
        :disabled="disabled"
        class="admin-toolbar-button"
        title="Heading Levels"
        type="button"
        @click="toggleHeadingMenu"
      >
        Heading
        <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        v-if="headingMenuOpen"
        class="absolute left-0 top-[calc(100%+0.4rem)] z-30 w-64 rounded-xl border border-[var(--admin-border)] bg-white p-2 shadow-xl"
      >
        <button
          v-for="heading in headingActions"
          :key="heading.id"
          :disabled="disabled"
          class="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          @click="selectHeading(heading.id)"
        >
          <span :class="heading.scale">
            {{ heading.label }}
          </span>
          <span class="text-xs font-medium text-slate-400">
            {{ heading.size }}
          </span>
        </button>
      </div>
    </div>

    <button
      v-for="action in quickActions"
      :key="action.id"
      :disabled="disabled"
      :title="action.title"
      class="admin-toolbar-button"
      type="button"
      @click="handleToolbarAction(action.id)"
    >
      {{ action.icon }}
    </button>

    <div class="mx-2 h-5 w-px bg-slate-200" />

    <button
      :disabled="disabled"
      class="admin-toolbar-button"
      title="Insert image from media library"
      type="button"
      @click="emit('imageUpload')"
    >
      Image
    </button>

    <button
      :disabled="disabled"
      class="admin-toolbar-button"
      title="Insert external image URL"
      type="button"
      @click="emit('externalImageInsert')"
    >
      URL
    </button>
  </div>
</template>
