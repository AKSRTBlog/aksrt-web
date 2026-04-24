<script setup lang="ts">
import type { MediaAssetItem, MediaUsage } from '~/types/admin';
import { renderMarkdown } from '~/composables/api';
import { buildMarkdownTable, type EditorViewMode, insertTextAtSelection } from '~/utils/admin-editor';
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
  | 'unorderedList'
  | 'orderedList'
  | 'link'
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
  }>(),
  {
    disabled: false,
    placeholder: '在这里编写 Markdown 内容...',
    previewPlaceholder: '## 开始编写\n\n这里会实时显示预览效果。',
    uploadUsage: 'article_content',
    mediaPickerTitle: '选择正文图片',
    toolbarClass: 'bg-slate-50/90',
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

const previewHtml = computed(() => renderMarkdown(previewSource.value));

function emitValue(value: string) {
  emit('update:modelValue', value);
}

function focusTextareaSelection(selectionStart: number, selectionEnd: number) {
  nextTick(() => {
    if (!textareaRef.value) {
      return;
    }

    textareaRef.value.focus();
    textareaRef.value.setSelectionRange(selectionStart, selectionEnd);
  });
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
  emitValue(next.value);
  focusTextareaSelection(next.selectionStart, next.selectionEnd);
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
  emitValue(next.value);
  focusTextareaSelection(next.selectionStart, next.selectionEnd);
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
    italic: () => insertTextAtSelection(textarea, '*', '*', '斜体文本'),
    quote: () => insertTextAtSelection(textarea, '\n> ', '', '引用内容'),
    inlineCode: () => insertTextAtSelection(textarea, '`', '`', '行内代码'),
    codeBlock: () => insertTextAtSelection(textarea, '\n```ts\n', '\n```\n', 'console.log("hello");'),
    unorderedList: () => insertTextAtSelection(textarea, '\n- ', '', '列表项'),
    orderedList: () => insertTextAtSelection(textarea, '\n1. ', '', '列表项'),
    link: () => insertTextAtSelection(textarea, '[', '](https://example.com)', '链接文本'),
    table: () => insertTextAtSelection(textarea, '', ''),
  };

  const next = actionMap[action]();
  emitValue(next.value);
  focusTextareaSelection(next.selectionStart, next.selectionEnd);
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
