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
  | 'collapseCard'
  | 'unorderedList'
  | 'orderedList'
  | 'link'
  | 'commentLock'
  | 'table'

const props = withDefaults(defineProps<{
  disabled?: boolean
  allowCommentLock?: boolean
}>(), {
  disabled: false,
  allowCommentLock: true,
})

const emit = defineEmits<{
  action: [action: ToolbarAction]
  imageUpload: []
  externalImageInsert: []
}>()

const rootRef = ref<HTMLElement | null>(null)
const headingMenuOpen = ref(false)
const listMenuOpen = ref(false)

const headingActions = [
  { id: 'h1', label: '一级标题', scale: 'text-3xl font-bold tracking-tight', size: '32px' },
  { id: 'h2', label: '二级标题', scale: 'text-2xl font-bold tracking-tight', size: '28px' },
  { id: 'h3', label: '三级标题', scale: 'text-xl font-semibold', size: '24px' },
  { id: 'h4', label: '四级标题', scale: 'text-lg font-semibold', size: '20px' },
  { id: 'h5', label: '五级标题', scale: 'text-base font-medium', size: '16px' },
  { id: 'h6', label: '六级标题', scale: 'text-sm font-medium uppercase tracking-wide', size: '14px' },
] as const

const allQuickActions = [
  { id: 'bold', title: '加粗', icon: '加粗' },
  { id: 'italic', title: '倾斜', icon: '倾斜' },
  { id: 'quote', title: '引用', icon: '引用' },
  { id: 'inlineCode', title: '行内代码', icon: '行内代码' },
  { id: 'codeBlock', title: '代码块', icon: '代码块' },
  { id: 'collapseCard', title: '插入展开与折叠卡片', icon: '折叠卡片' },
  { id: 'link', title: '链接', icon: '链接' },
  { id: 'commentLock', title: '评论后可见', icon: '评论可见' },
  { id: 'table', title: '表格', icon: '表格' },
] as const

const quickActions = computed(() =>
  allQuickActions.filter(action => props.allowCommentLock || action.id !== 'commentLock'),
)

const listActions = [
  { id: 'unorderedList', label: '无序列表' },
  { id: 'orderedList', label: '有序列表' },
] as const

function handleToolbarAction(action: ToolbarAction) {
  emit('action', action)
}

function toggleHeadingMenu() {
  headingMenuOpen.value = !headingMenuOpen.value
  if (headingMenuOpen.value) {
    listMenuOpen.value = false
  }
}

function toggleListMenu() {
  listMenuOpen.value = !listMenuOpen.value
  if (listMenuOpen.value) {
    headingMenuOpen.value = false
  }
}

function closeHeadingMenu() {
  headingMenuOpen.value = false
}

function closeListMenu() {
  listMenuOpen.value = false
}

function selectHeading(action: (typeof headingActions)[number]['id']) {
  emit('action', action)
  closeHeadingMenu()
}

function selectList(action: (typeof listActions)[number]['id']) {
  emit('action', action)
  closeListMenu()
}

function handleGlobalPointerDown(event: PointerEvent) {
  if ((!headingMenuOpen.value && !listMenuOpen.value) || !rootRef.value) {
    return
  }

  const target = event.target as Node | null
  if (!target || rootRef.value.contains(target)) {
    return
  }

  closeHeadingMenu()
  closeListMenu()
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
        :disabled="props.disabled"
        class="admin-toolbar-button"
        title="标题层级"
        type="button"
        @click="toggleHeadingMenu"
      >
        标题
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
          :disabled="props.disabled"
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
      :disabled="props.disabled"
      :title="action.title"
      class="admin-toolbar-button"
      type="button"
      @click="handleToolbarAction(action.id)"
    >
      <span>{{ action.icon }}</span>
    </button>

    <div class="relative">
      <button
        :disabled="props.disabled"
        class="admin-toolbar-button"
        title="列表"
        type="button"
        @click="toggleListMenu"
      >
        列表
        <svg class="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        v-if="listMenuOpen"
        class="absolute left-0 top-[calc(100%+0.4rem)] z-30 w-40 rounded-xl border border-[var(--admin-border)] bg-white p-2 shadow-xl"
      >
        <button
          v-for="action in listActions"
          :key="action.id"
          :disabled="props.disabled"
          class="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
          @click="selectList(action.id)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <div class="mx-2 h-5 w-px bg-slate-200" />

    <button
      :disabled="props.disabled"
      class="admin-toolbar-button"
      title="从媒体库插入图片"
      type="button"
      @click="emit('imageUpload')"
    >
      图片
    </button>

    <button
      :disabled="props.disabled"
      class="admin-toolbar-button"
      title="插入外链图片"
      type="button"
      @click="emit('externalImageInsert')"
    >
      外链
    </button>
  </div>
</template>
