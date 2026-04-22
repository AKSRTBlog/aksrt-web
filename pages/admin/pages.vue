<script setup lang="ts">
import MediaPickerDialog from '~/components/admin/MediaPickerDialog.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '独立页面',
})

const {
  items,
  loading,
  saving,
  error,
  successMessage,
  activeId,
  activePage,
  makePage,
  sanitizeArticleSlug,
  insertTextAtSelection,
  buildMarkdownTable,
  loadPages,
  savePages,
  updateItem,
  moveItem,
  addPage,
  removePage,
} = useAdminStandalonePages()

// 编辑器状态
const viewMode = ref<'edit' | 'split' | 'preview'>('split')
const mediaPickerOpen = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

// 对话框状态
const externalImageDialogOpen = ref(false)
const externalImageUrl = ref('https://')
const tableDialogOpen = ref(false)
const tableRowCount = ref('3')
const tableColumnCount = ref('3')
const externalImageDialogError = ref('')
const tableDialogError = ref('')

// 加载数据
onMounted(() => {
  loadPages()
})

// 处理工具栏操作
function handleToolbarAction(
  action: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'bold' | 'italic' | 'quote' | 'code' | 'list' | 'link' | 'table' | 'image',
) {
  const textarea = textareaRef.value
  if (!textarea || !activePage.value)
    return

  if (action === 'table') {
    tableRowCount.value = '3'
    tableColumnCount.value = '3'
    tableDialogError.value = ''
    tableDialogOpen.value = true
    return
  }

  const headingMap: Record<string, () => ReturnType<typeof insertTextAtSelection>> = {
    h1: () => insertTextAtSelection(textarea, '\n# ', '', '一级标题'),
    h2: () => insertTextAtSelection(textarea, '\n## ', '', '二级标题'),
    h3: () => insertTextAtSelection(textarea, '\n### ', '', '三级标题'),
    h4: () => insertTextAtSelection(textarea, '\n#### ', '', '四级标题'),
    h5: () => insertTextAtSelection(textarea, '\n##### ', '', '五级标题'),
    h6: () => insertTextAtSelection(textarea, '\n###### ', '', '六级标题'),
  }

  if (action in headingMap) {
    const next = headingMap[action]()
    updateItem(activePage.value!.id, item => ({ ...item, content: next.value }))
    textarea.focus()
    textarea.setSelectionRange(next.selectionStart, next.selectionEnd)
    return
  }

  const actionMap = {
    bold: () => insertTextAtSelection(textarea, '**', '**', '加粗文本'),
    italic: () => insertTextAtSelection(textarea, '*', '*', '斜体文本'),
    quote: () => insertTextAtSelection(textarea, '\n> ', '', '引用内容'),
    code: () => insertTextAtSelection(textarea, '\n```ts\n', '\n```\n', 'console.log("hello");'),
    list: () => insertTextAtSelection(textarea, '\n- ', '', '列表项'),
    link: () => insertTextAtSelection(textarea, '[', '](https://example.com)', '链接文字'),
    image: () => insertTextAtSelection(textarea, '![图片描述](', ')', '图片描述'),
  } as const

  const next = actionMap[action as keyof typeof actionMap]()
  updateItem(activePage.value!.id, item => ({ ...item, content: next.value }))
  textarea.focus()
  textarea.setSelectionRange(next.selectionStart, next.selectionEnd)
}

// 插入外链图片
function openExternalImageDialog() {
  externalImageUrl.value = 'https://'
  externalImageDialogError.value = ''
  externalImageDialogOpen.value = true
}

function closeExternalImageDialog() {
  externalImageDialogOpen.value = false
  externalImageDialogError.value = ''
}

function confirmExternalImageInsert() {
  const textarea = textareaRef.value
  if (!textarea || !activePage.value)
    return

  const trimmedUrl = externalImageUrl.value.trim()
  if (!trimmedUrl || !/^https?:\/\//i.test(trimmedUrl)) {
    externalImageDialogError.value = 'Please enter a valid image URL starting with http:// or https://'
    return
  }

  const next = insertTextAtSelection(textarea, '![图片描述](', `](${trimmedUrl})`, '图片描述')
  updateItem(activePage.value.id, item => ({ ...item, content: next.value }))
  textarea.focus()
  textarea.setSelectionRange(next.selectionStart, next.selectionEnd)
  closeExternalImageDialog()
}

// 插入表格
function closeTableDialog() {
  tableDialogOpen.value = false
  tableDialogError.value = ''
}

function confirmTableInsert() {
  const textarea = textareaRef.value
  if (!textarea || !activePage.value)
    return

  const rows = Number.parseInt(tableRowCount.value, 10)
  const columns = Number.parseInt(tableColumnCount.value, 10)

  if (!Number.isFinite(rows) || !Number.isFinite(columns) || rows < 1 || columns < 1) {
    tableDialogError.value = 'Rows and columns must be positive integers.'
    return
  }

  if (rows > 30 || columns > 15) {
    tableDialogError.value = 'Table is too large. Keep rows <= 30 and columns <= 15.'
    return
  }

  tableDialogError.value = ''
  const tableMarkdown = buildMarkdownTable(rows, columns)
  const next = insertTextAtSelection(textarea, '\n', `\n${tableMarkdown}\n`)
  updateItem(activePage.value.id, item => ({ ...item, content: next.value }))
  textarea.focus()
  textarea.setSelectionRange(next.selectionStart, next.selectionEnd)
  closeTableDialog()
}

function applyMediaSelection(asset: { url: string; altText?: string | null; title?: string | null }) {
  const textarea = textareaRef.value
  if (!textarea || !activePage.value)
    return

  const altText = asset.altText?.trim() || asset.title?.trim() || '图片'
  const next = insertTextAtSelection(textarea, `\n![${altText}](`, `)\n`, asset.url)
  updateItem(activePage.value.id, item => ({ ...item, content: next.value }))
  textarea.focus()
  textarea.setSelectionRange(next.selectionStart, next.selectionEnd)
  mediaPickerOpen.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- 外链图片对话框 -->
        <Teleport to="body">
      <div
        v-if="externalImageDialogOpen"
        class="admin-modal-overlay admin-modal-overlay-sheet"
        @click.self="closeExternalImageDialog"
      >
        <div
          class="admin-card w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-[var(--admin-border)] bg-white p-0 sm:max-w-lg sm:rounded-[4px] sm:border"
        >
          <div class="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Image URL</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">Insert External Image</h3>
            </div>
            <button class="admin-button-secondary px-3 py-2" type="button" @click="closeExternalImageDialog">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 p-5">
            <p class="text-sm text-slate-500">Paste a direct image URL to insert it into the markdown content.</p>

            <div
              v-if="externalImageDialogError"
              class="rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {{ externalImageDialogError }}
            </div>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-slate-700">Image URL</span>
              <input
                v-model="externalImageUrl"
                class="admin-input"
                placeholder="https://example.com/image.jpg"
                @keyup.enter="confirmExternalImageInsert"
              />
            </label>

            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button class="admin-button-secondary" type="button" @click="closeExternalImageDialog">
                Cancel
              </button>
              <button class="admin-button-primary" type="button" @click="confirmExternalImageInsert">
                Insert Image
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 表格对话框 -->
        <Teleport to="body">
      <div
        v-if="tableDialogOpen"
        class="admin-modal-overlay admin-modal-overlay-sheet"
        @click.self="closeTableDialog"
      >
        <div
          class="admin-card w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border-t border-[var(--admin-border)] bg-white p-0 sm:max-w-lg sm:rounded-[4px] sm:border"
        >
          <div class="flex items-center justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Table</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">Insert Table</h3>
            </div>
            <button class="admin-button-secondary px-3 py-2" type="button" @click="closeTableDialog">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 p-5">
            <p class="text-sm text-slate-500">Choose row and column counts for the Markdown table.</p>

            <div
              v-if="tableDialogError"
              class="rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {{ tableDialogError }}
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">Rows</span>
                <input
                  v-model="tableRowCount"
                  class="admin-input"
                  type="number"
                  min="1"
                  max="30"
                />
              </label>
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">Columns</span>
                <input
                  v-model="tableColumnCount"
                  class="admin-input"
                  type="number"
                  min="1"
                  max="15"
                />
              </label>
            </div>
            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button class="admin-button-secondary" type="button" @click="closeTableDialog">
                Cancel
              </button>
              <button class="admin-button-primary" type="button" @click="confirmTableInsert">
                Insert Table
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <AdminPageHeader
      title="独立页"
      description="管理站点中的自定义独立页面。保存后可通过 /pages/slug 访问，也可以手动加入导航菜单。"
    >
      <template #actions>
        <NuxtLink
          v-if="activePage?.slug"
          :to="`/pages/${activePage.slug}`"
          target="_blank"
          class="admin-button-secondary"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          预览页面
        </NuxtLink>
        <button class="admin-button-secondary" :disabled="loading" @click="loadPages">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
        <button class="admin-button-primary" :disabled="saving" @click="savePages">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存独立页
        </button>
      </template>
    </AdminPageHeader>

    <!-- 消息提示 -->
    <div
      v-if="error"
      class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ error }}
    </div>
    <div
      v-if="successMessage"
      class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
    >
      {{ successMessage }}
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="admin-card p-6 text-center text-sm text-slate-500">
      正在加载独立页...
    </div>

    <!-- 内容 -->
    <template v-if="!loading">
      <section class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <!-- 侧边栏：页面列表 -->
        <aside class="admin-card overflow-hidden p-0">
          <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900">页面列表</h3>
              <p class="text-sm text-slate-500">支持排序、启用和删除。</p>
            </div>
            <button class="admin-button-secondary" type="button" @click="addPage">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新建
            </button>
          </div>

          <div class="divide-y divide-[var(--admin-border)]">
            <button
              v-for="(item, index) in items"
              :key="item.id"
              class="w-full px-5 py-4 text-left transition"
              :class="item.id === activePage?.id ? 'bg-blue-50' : 'hover:bg-slate-50/70'"
              type="button"
              @click="activeId = item.id"
            >
              <div class="flex items-start gap-3">
                <!-- 排序控制 -->
                <div class="mt-0.5 flex flex-col gap-1">
                  <button
                    :disabled="index === 0"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    title="上移"
                    type="button"
                    @click.stop="moveItem(index, 'up')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    :disabled="index === items.length - 1"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    title="下移"
                    type="button"
                    @click.stop="moveItem(index, 'down')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <!-- 页面信息 -->
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="truncate font-medium text-slate-900">
                      {{ item.title.trim() || `未命名页面 ${index + 1}` }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      :class="item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ item.enabled ? '启用' : '停用' }}
                    </span>
                  </div>
                  <p class="mt-1 truncate text-xs text-slate-500">
                    {{ item.slug ? `/pages/${item.slug}` : '还没有 slug' }}
                  </p>
                  <p class="mt-2 line-clamp-2 text-sm text-slate-600">
                    {{ item.summary.trim() || '填写页面摘要后，这里会显示简介。' }}
                  </p>
                </div>

                <!-- 删除按钮 -->
                <button
                  class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="删除"
                  type="button"
                  @click.stop="removePage(item.id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </button>
          </div>
        </aside>

        <!-- 主编辑区 -->
        <div v-if="activePage" class="space-y-6">
          <!-- 基本信息 -->
          <section class="admin-card p-6">
            <div class="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <strong>提示：</strong>标题、Slug、摘要和内容都是必填项，请完整填写后再保存。
            </div>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  页面标题 <span class="text-rose-500">*</span>
                </label>
                <input
                  :value="activePage.title"
                  class="admin-input"
                  placeholder="例如：关于本站"
                  @input="updateItem(activePage.id, (item) => {
                    const currentTitleSlug = sanitizeArticleSlug(item.title)
                    const nextTitle = ($event.target as HTMLInputElement).value
                    const shouldSyncSlug = !item.slug || item.slug === currentTitleSlug
                    return {
                      ...item,
                      title: nextTitle,
                      slug: shouldSyncSlug ? sanitizeArticleSlug(nextTitle) : item.slug
                    }
                  })"
                >
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  页面 Slug <span class="text-rose-500">*</span>
                </label>
                <div class="flex gap-3">
                  <input
                    :value="activePage.slug"
                    class="admin-input"
                    placeholder="about-site"
                    @input="updateItem(activePage.id, item => ({ ...item, slug: sanitizeArticleSlug(($event.target as HTMLInputElement).value) }))"
                  >
                  <button
                    class="admin-button-secondary shrink-0"
                    type="button"
                    @click="updateItem(activePage.id, item => ({ ...item, slug: sanitizeArticleSlug(item.title) || item.slug }))"
                  >
                    生成
                  </button>
                </div>
              </div>

              <div class="flex items-end">
                <label class="flex items-center gap-3">
                  <button
                    :class="activePage.enabled ? 'admin-switch admin-switch-on' : 'admin-switch'"
                    type="button"
                    @click="updateItem(activePage.id, item => ({ ...item, enabled: !item.enabled }))"
                  >
                    <span class="admin-switch-thumb" />
                  </button>
                  <span class="text-sm font-medium text-slate-700">前台可见</span>
                </label>
              </div>

              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  页面摘要 <span class="text-rose-500">*</span>
                </label>
                <textarea
                  :value="activePage.summary"
                  class="admin-textarea min-h-24"
                  placeholder="用于页面顶部简介，也方便后台列表快速识别。"
                  @input="updateItem(activePage.id, item => ({ ...item, summary: ($event.target as HTMLTextAreaElement).value }))"
                />
              </div>
            </div>
          </section>

          <!-- Markdown 编辑器 -->
          <div class="admin-card overflow-hidden p-0">
            <div class="flex items-center justify-between border-b border-[var(--admin-border)] bg-amber-50/50 px-5 py-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">页面内容</span>
                <span class="text-rose-500">*</span>
              </div>
              <span class="text-xs text-slate-500">必填项，使用 Markdown 编写</span>
            </div>

            <!-- 工具栏 -->
            <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-slate-50/90 px-4 py-3">
              <MarkdownToolbar
                :disabled="saving"
                @action="handleToolbarAction"
                @image-upload="mediaPickerOpen = true"
                @external-image-insert="openExternalImageDialog"
              />
              <div class="flex gap-2">
                <button
                  :class="viewMode === 'edit' ? 'admin-button-primary' : 'admin-button-secondary'"
                  type="button"
                  @click="viewMode = 'edit'"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑
                </button>
                <button
                  :class="viewMode === 'split' ? 'admin-button-primary' : 'admin-button-secondary'"
                  type="button"
                  @click="viewMode = 'split'"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  分栏
                </button>
                <button
                  :class="viewMode === 'preview' ? 'admin-button-primary' : 'admin-button-secondary'"
                  type="button"
                  @click="viewMode = 'preview'"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  预览
                </button>
              </div>
            </div>

            <!-- 编辑器 -->
            <div :class="['grid min-h-[720px]', viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1']">
              <div
                v-if="viewMode !== 'preview'"
                class="border-r border-[var(--admin-border)]"
                :class="viewMode === 'split' ? '' : 'border-r-0'"
              >
                <textarea
                  ref="textareaRef"
                  :value="activePage.content"
                  class="admin-editor-textarea"
                  placeholder="使用 Markdown 编写页面内容..."
                  @input="updateItem(activePage.id, item => ({ ...item, content: ($event.target as HTMLTextAreaElement).value }))"
                />
              </div>
              <div v-if="viewMode !== 'edit'" :class="viewMode === 'preview' ? '' : 'bg-white'">
                <MarkdownPreview :value="activePage.content || '## 开始编辑\n\n右侧会显示实时预览。'" />
              </div>
            </div>
          </div>

          <!-- 提示信息 -->
          <section class="admin-card p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="space-y-2 text-sm text-slate-600">
                <p>当前访问地址：{{ activePage.slug ? `/pages/${activePage.slug}` : '请先填写 slug' }}</p>
                <p>如果你希望它出现在前台顶部菜单，可以到"分类设置"里的导航菜单中手动新增对应链接。</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>

    <!-- 媒体选择器 -->
    <MediaPickerDialog
      :open="mediaPickerOpen"
      title="选择图片"
      empty-message="暂无可选图片，请先上传一张。"
      search-placeholder="搜索媒体库图片"
      upload-usage="article_content"
      @close="mediaPickerOpen = false"
      @select="applyMediaSelection"
    />
  </div>
</template>
