<script setup lang="ts">
import type { MediaAssetItem, MediaUsage } from '~/types/admin';
import { renderMarkdown } from '~/composables/api';
import { buildMarkdownTable, handleMarkdownListEnter, insertCommentLockBlock, insertMarkdownList, type EditorViewMode, insertTextAtSelection } from '~/utils/admin-editor';
import { buildCommentLockPreviewMarkdown, type CommentLockPreviewMode } from '~/utils/comment-lock';
import { enhanceMarkdownCodeBlocks } from '~/utils/markdown-code-blocks';

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
  | 'table';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    disabled?: boolean;
    placeholder?: string;
    previewPlaceholder?: string;
    uploadUsage?: MediaUsage;
    mediaPickerTitle?: string;
    toolbarClass?: string;
    allowCommentLock?: boolean;
    commentLockPreviewMode?: CommentLockPreviewMode;
  }>(),
  {
    disabled: false,
    placeholder: '在这里编写 Markdown 内容...',
    previewPlaceholder: '## 开始编写\n\n这里会实时显示预览效果。',
    uploadUsage: 'article_content',
    mediaPickerTitle: '选择正文图片',
    toolbarClass: 'bg-slate-50/90',
    allowCommentLock: true,
    commentLockPreviewMode: 'unlock',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  imageInserted: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const previewRootRef = ref<HTMLElement | null>(null);
const viewMode = ref<EditorViewMode>('split');
const mediaPickerOpen = ref(false);
const tableDialogOpen = ref(false);
const externalImageDialogOpen = ref(false);
const tableRowCount = ref('3');
const tableColumnCount = ref('3');
const tableDialogError = ref('');
const externalImageUrl = ref('https://');
const externalImageDialogError = ref('');

const previewSource = computed(() => {
  return props.modelValue.trim() ? props.modelValue : props.previewPlaceholder;
});

const previewHtml = computed(() => renderMarkdown(buildCommentLockPreviewMarkdown(previewSource.value, props.commentLockPreviewMode)));

function emitValue(value: string) {
  emit('update:modelValue', value);
}

/** 待恢复的滚动位置（用于防止 focus() 导致页面跳动） */
let pendingScrollRestore: { x: number; y: number; container: HTMLElement | null; scrollTop: number } | null = null;

/**
 * 同步设置 textarea 的值和光标位置，同时保持页面不跳动。
 *
 * 实现策略：
 *   1. 直接修改 DOM .value（同步生效，立即可设光标）
 *   2. 用 requestAnimationFrame 恢复滚动位置（抵消 focus() 的副作用）
 *   3. 用 nextTick + rAF 二次校验（防 v-model 回写覆盖光标）
 */
function syncSetTextarea(value: string, selStart: number, selEnd: number) {
  const ta = textareaRef.value;
  if (!ta) return;

  // ── 保存滚动位置 ──
  const winScrollX = window.scrollX;
  const winScrollY = window.scrollY;
  let containerScrollTop = 0;
  const scrollContainer = findScrollableAncestor(ta);
  if (scrollContainer && scrollContainer !== document.body && scrollContainer !== document.documentElement) {
    containerScrollTop = scrollContainer.scrollTop;
  }
  pendingScrollRestore = { x: winScrollX, y: winScrollY, container: scrollContainer, scrollTop: containerScrollTop };

  // ── 同步操作 DOM ──
  ta.value = value;
  ta.focus();
  ta.setSelectionRange(selStart, selEnd);

  // ── 恢复滚动（rAF 确保在浏览器布局之后）──
  restoreScrollPosition();

  // ── 防御 v-model 覆盖：Vue 下一 tick 可能重写 .value，需重新设光标 ──
  nextTick(() => {
    if (!textareaRef.value) return;
    // 如果 v-model 回写的值和我们预期的一致，只需确认光标还在
    if (textareaRef.value.value === value) {
      // 值没变，但某些情况下 setSelectionRange 会被清零，重新设一次
      const { selectionStart: ss, selectionEnd: se } = textareaRef.value;
      if (ss !== selStart || se !== selEnd) {
        textareaRef.value.setSelectionRange(selStart, selEnd);
      }
      restoreScrollPosition();
    }
    // 如果值被 watcher/middleware 变换了（极少见），这里不强制覆盖，
    // 因为那说明父组件有业务逻辑需要不同值，强行改回会导致数据不一致
  });
}

/** 执行挂起的滚动恢复 */
function restoreScrollPosition() {
  if (!pendingScrollRestore) return;
  const { x, y, container, scrollTop } = pendingScrollRestore;
  requestAnimationFrame(() => {
    if (container && container !== document.body && container !== document.documentElement) {
      container.scrollTop = scrollTop;
    }
    window.scrollTo(x, y);
    // 二次确认（部分浏览器/WebView 需要）
    requestAnimationFrame(() => window.scrollTo(x, y));
  });
  pendingScrollRestore = null;
}

/** 查找 textarea 最近的可滚动祖先容器 */
function findScrollableAncestor(el: HTMLElement | null): HTMLElement | null {
  while (el && el !== document.body) {
    if (el.scrollHeight > el.clientHeight) return el;
    el = el.parentElement;
  }
  return null;
}

function applyInsertion(
  builder: (textarea: HTMLTextAreaElement) => {
    value: string;
    selectionStart: number;
    selectionEnd: number;
  },
) {
  if (!textareaRef.value) {
    viewMode.value = 'edit';
    return;
  }

  const next = builder(textareaRef.value);

  // 1. 同步更新 DOM（立即可用）
  syncSetTextarea(next.value, next.selectionStart, next.selectionEnd);

  // 2. 通知父组件更新响应式数据（Vue 会在下一 tick 比对并发现一致）
  emitValue(next.value);
}

function enhancePreviewCodeBlocks() {
  if (import.meta.server || !previewRootRef.value) {
    return;
  }

  enhanceMarkdownCodeBlocks(previewRootRef.value);
}

function openExternalImageDialog() {
  externalImageUrl.value = 'https://';
  externalImageDialogError.value = '';
  externalImageDialogOpen.value = true;
}

function closeExternalImageDialog() {
  externalImageDialogOpen.value = false;
  externalImageDialogError.value = '';
}

function confirmExternalImageInsert() {
  const textarea = textareaRef.value;

  if (!textarea) {
    viewMode.value = 'edit';
    return;
  }

  const trimmedUrl = externalImageUrl.value.trim();
  if (!trimmedUrl || !/^https?:\/\//i.test(trimmedUrl)) {
    externalImageDialogError.value = '请输入以 http:// 或 https:// 开头的有效图片地址。';
    return;
  }

  const next = insertTextAtSelection(textarea, '\n![image](', `)\n`, trimmedUrl);
  syncSetTextarea(next.value, next.selectionStart, next.selectionEnd);
  emitValue(next.value);
  closeExternalImageDialog();
  emit('imageInserted');
}

function openTableDialog() {
  tableRowCount.value = '3';
  tableColumnCount.value = '3';
  tableDialogError.value = '';
  tableDialogOpen.value = true;
}

function closeTableDialog() {
  tableDialogOpen.value = false;
  tableDialogError.value = '';
}

function confirmTableInsert() {
  const rows = Number.parseInt(tableRowCount.value, 10);
  const columns = Number.parseInt(tableColumnCount.value, 10);

  if (!Number.isFinite(rows) || !Number.isFinite(columns) || rows < 1 || columns < 1) {
    tableDialogError.value = '行数和列数必须是大于 0 的整数。';
    return;
  }

  if (rows > 30 || columns > 15) {
    tableDialogError.value = '表格过大，请保持行数不超过 30、列数不超过 15。';
    return;
  }

  tableDialogError.value = '';
  const tableMarkdown = buildMarkdownTable(rows, columns);
  applyInsertion((textarea) => insertTextAtSelection(textarea, '\n', `\n${tableMarkdown}\n`));
  closeTableDialog();
}

function resolveInlineImageAltText(asset: MediaAssetItem) {
  const candidate = asset.altText?.trim() || asset.title.trim() || asset.originalFilename.trim() || 'image';
  return candidate.replace(/[\r\n]+/g, ' ').replace(/[[\]]/g, '').trim() || 'image';
}

function applyMediaSelection(asset: MediaAssetItem) {
  applyInsertion((textarea) => {
    const altText = resolveInlineImageAltText(asset);
    return insertTextAtSelection(textarea, `\n![${altText}](`, ')\n', asset.url);
  });
  mediaPickerOpen.value = false;
  emit('imageInserted');
}

function handleToolbarAction(action: ToolbarAction) {
  if (action === 'table') {
    openTableDialog();
    return;
  }

  const textarea = textareaRef.value;
  if (!textarea) {
    viewMode.value = 'edit';
    return;
  }

  const actionMap: Record<ToolbarAction, () => ReturnType<typeof insertTextAtSelection>> = {
    h1: () => insertTextAtSelection(textarea, '\n# ', '', '一级标题'),
    h2: () => insertTextAtSelection(textarea, '\n## ', '', '二级标题'),
    h3: () => insertTextAtSelection(textarea, '\n### ', '', '三级标题'),
    h4: () => insertTextAtSelection(textarea, '\n#### ', '', '四级标题'),
    h5: () => insertTextAtSelection(textarea, '\n##### ', '', '五级标题'),
    h6: () => insertTextAtSelection(textarea, '\n###### ', '', '六级标题'),
    bold: () => insertTextAtSelection(textarea, '**', '**', '加粗文本'),
    italic: () => insertTextAtSelection(textarea, '*', '*', '倾斜文本'),
    quote: () => insertTextAtSelection(textarea, '\n> ', '', '引用内容'),
    inlineCode: () => insertTextAtSelection(textarea, '`', '`', '行内代码'),
    codeBlock: () => insertTextAtSelection(textarea, '\n```ts\n', '\n```\n', 'console.log("hello");'),
    collapseCard: () => insertTextAtSelection(textarea, '\n:::collapse ', '\n这里填写折叠内容。\n:::\n', '显示的标题'),
    unorderedList: () => insertMarkdownList(textarea, 'unordered'),
    orderedList: () => insertMarkdownList(textarea, 'ordered'),
    link: () => insertTextAtSelection(textarea, '[', '](https://example.com)', '链接文本'),
    commentLock: () => insertCommentLockBlock(textarea),
    table: () => insertTextAtSelection(textarea, '', ''),
  };

  const next = actionMap[action]();
  syncSetTextarea(next.value, next.selectionStart, next.selectionEnd);
  emitValue(next.value);
}

function handleTextareaKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || !textareaRef.value) {
    return;
  }

  const next = handleMarkdownListEnter(textareaRef.value);
  if (!next) {
    return;
  }

  event.preventDefault();
  syncSetTextarea(next.value, next.selectionStart, next.selectionEnd);
  emitValue(next.value);
}

watch(
  [previewHtml, viewMode],
  async () => {
    await nextTick();
    enhancePreviewCodeBlocks();
  },
  { immediate: true },
);
</script>

<template>
  <div class="overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3" :class="toolbarClass">
      <AdminMarkdownToolbar
        :disabled="disabled"
        :allow-comment-lock="props.allowCommentLock"
        @action="handleToolbarAction"
        @image-upload="mediaPickerOpen = true"
        @external-image-insert="openExternalImageDialog"
      />

      <div class="ml-auto flex flex-wrap gap-2">
        <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'edit' }" type="button" @click="viewMode = 'edit'">
          编辑
        </button>
        <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'split' }" type="button" @click="viewMode = 'split'">
          分栏
        </button>
        <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'preview' }" type="button" @click="viewMode = 'preview'">
          预览
        </button>
      </div>
    </div>

    <div
      class="grid min-h-[560px] lg:min-h-[720px]"
      :class="viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'"
    >
      <div
        v-if="viewMode !== 'preview'"
        class="min-h-[560px] lg:min-h-[720px]"
        :class="viewMode === 'split' ? 'border-r border-[var(--admin-border)]' : ''"
      >
        <textarea
          ref="textareaRef"
          class="admin-editor-textarea min-h-[560px] h-full lg:min-h-[720px]"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="emitValue(($event.target as HTMLTextAreaElement).value)"
          @keydown="handleTextareaKeydown"
        />
      </div>

      <div
        v-if="viewMode !== 'edit'"
        class="min-h-[560px] lg:min-h-[720px] bg-white"
      >
        <article ref="previewRootRef" class="article-content admin-markdown-preview mx-auto max-w-none px-6 py-6" v-html="previewHtml" />
      </div>
    </div>

    <AdminMediaPickerDialog
      :open="mediaPickerOpen"
      :title="mediaPickerTitle"
      empty-message="当前还没有可用图片，可以在这里上传后插入到编辑器中。"
      search-placeholder="搜索媒体库图片"
      :upload-usage="uploadUsage"
      @close="mediaPickerOpen = false"
      @select="applyMediaSelection"
    />

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
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">图片地址</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">插入外链图片</h3>
            </div>
            <button class="admin-button-secondary px-3 py-2" type="button" @click="closeExternalImageDialog">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 p-5">
            <p class="text-sm text-slate-500">粘贴图片的直链地址，即可将它插入 Markdown 正文中。</p>

            <div
              v-if="externalImageDialogError"
              class="rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {{ externalImageDialogError }}
            </div>

            <label class="block">
              <span class="mb-2 block text-sm font-medium text-slate-700">图片地址</span>
              <input
                v-model="externalImageUrl"
                class="admin-input"
                placeholder="https://example.com/image.jpg"
                @keyup.enter="confirmExternalImageInsert"
              />
            </label>

            <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button class="admin-button-secondary" type="button" @click="closeExternalImageDialog">
                取消
              </button>
              <button class="admin-button-primary" type="button" @click="confirmExternalImageInsert">
                插入图片
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">表格</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">插入表格</h3>
            </div>
            <button class="admin-button-secondary px-3 py-2" type="button" @click="closeTableDialog">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-4 p-5">
            <p class="text-sm text-slate-500">设置 Markdown 表格的行数和列数。</p>

            <div
              v-if="tableDialogError"
              class="rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600"
            >
              {{ tableDialogError }}
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">行数</span>
                <input
                  v-model="tableRowCount"
                  class="admin-input"
                  type="number"
                  min="1"
                  max="30"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">列数</span>
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
                取消
              </button>
              <button class="admin-button-primary" type="button" @click="confirmTableInsert">
                插入表格
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-fold-editor {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.96) 0%, rgba(255, 255, 255, 0.98) 100%);
}

.admin-fold-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid var(--admin-border);
  background: rgba(255, 255, 255, 0.82);
  padding: 0.8rem 1rem;
}

.admin-fold-tree {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
}

.admin-fold-node {
  margin-left: calc(var(--fold-depth, 0) * 1rem);
}

.admin-fold-row {
  display: flex;
  min-height: 2.75rem;
  width: 100%;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid transparent;
  border-radius: 0.8rem;
  padding: 0.55rem 0.7rem;
  text-align: left;
  color: #334155;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease;
}

.admin-fold-row:hover {
  border-color: rgba(37, 99, 235, 0.14);
  background: rgba(239, 246, 255, 0.78);
}

.admin-fold-row-open {
  border-color: rgba(37, 99, 235, 0.12);
  background: rgba(248, 250, 252, 0.92);
}

.admin-fold-row:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.admin-fold-icon {
  width: 1rem;
  height: 1rem;
  flex: 0 0 auto;
  color: #2563eb;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.admin-fold-row:hover .admin-fold-icon {
  transform: scale(1.08);
}

.admin-fold-heading {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-fold-code,
.admin-fold-text {
  color: #475569;
  font-size: 0.88rem;
  font-weight: 600;
}

.admin-fold-code::before {
  content: '```';
  margin-right: 0.35rem;
  color: #2563eb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.admin-fold-heading-1 {
  font-size: 1.08rem;
  font-weight: 800;
  color: #0f172a;
}

.admin-fold-heading-2 {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
}

.admin-fold-heading-3,
.admin-fold-heading-4,
.admin-fold-heading-5,
.admin-fold-heading-6 {
  font-size: 0.92rem;
  font-weight: 650;
}

.admin-fold-lines {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f1f5f9;
  padding: 0.15rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 650;
  color: #64748b;
  white-space: nowrap;
}

.admin-fold-row-open .admin-fold-lines {
  background: #dbeafe;
  color: #1d4ed8;
}

.admin-fold-children {
  overflow: hidden;
  animation: fold-slide-in 0.18s ease-out;
}

.admin-fold-content {
  margin: 0.15rem 0 0.75rem 2.35rem;
  overflow: hidden;
  border-left: 2px solid rgba(37, 99, 235, 0.14);
  padding: 0.25rem 0 0.25rem 0.85rem;
  color: #475569;
  animation: fold-slide-in 0.18s ease-out;
}

.admin-fold-content :deep(p) {
  margin: 0.45rem 0;
  font-size: 0.9rem;
  line-height: 1.75;
}

.admin-fold-content :deep(pre) {
  margin: 0.45rem 0;
  overflow-x: auto;
  border-radius: 0.85rem;
  background: #0f172a;
  padding: 0.9rem;
  color: #e2e8f0;
  font-size: 0.82rem;
  line-height: 1.65;
}

.admin-fold-content :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

@media (max-width: 640px) {
  .admin-fold-editor {
    min-height: 65dvh;
    max-height: 78dvh;
  }

  .admin-fold-toolbar {
    align-items: stretch;
    padding: 0.7rem;
  }

  .admin-fold-toolbar > div {
    width: 100%;
  }

  .admin-fold-toolbar .admin-toolbar-button {
    flex: 1;
    min-height: 2.5rem;
  }

  .admin-fold-tree {
    padding: 0.55rem;
  }

  .admin-fold-node {
    margin-left: calc(var(--fold-depth, 0) * 0.55rem);
  }

  .admin-fold-row {
    min-height: 2.55rem;
    gap: 0.5rem;
    border-radius: 0.7rem;
    padding: 0.5rem 0.55rem;
  }

  .admin-fold-heading {
    white-space: normal;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .admin-fold-lines {
    max-width: 5.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .admin-fold-content {
    margin-left: 1.7rem;
    padding-left: 0.65rem;
  }

  .admin-fold-content :deep(pre) {
    max-width: 100%;
    border-radius: 0.7rem;
    font-size: 0.78rem;
  }
}

@keyframes fold-slide-in {
  from {
    opacity: 0;
    transform: translateY(-0.25rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
