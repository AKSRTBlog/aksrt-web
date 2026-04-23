<script setup lang="ts">
import type { MediaAssetItem, MediaUsage } from '~/types/admin';
import { renderMarkdown } from '~/composables/api';
import { buildMarkdownTable, type EditorViewMode, insertTextAtSelection } from '~/utils/admin-editor';

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
    placeholder: 'Write markdown content here...',
    previewPlaceholder: '## Start Editing\n\nLive preview appears here.',
    uploadUsage: 'article_content',
    mediaPickerTitle: 'Choose Inline Image',
    toolbarClass: 'bg-slate-50/90',
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  imageInserted: [];
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
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
    externalImageDialogError.value = 'Please enter a valid image URL starting with http:// or https://';
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
    tableDialogError.value = 'Rows and columns must be positive integers.';
    return;
  }

  if (rows > 30 || columns > 15) {
    tableDialogError.value = 'Table is too large. Keep rows <= 30 and columns <= 15.';
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
    h1: () => insertTextAtSelection(textarea, '\n# ', '', 'Heading 1'),
    h2: () => insertTextAtSelection(textarea, '\n## ', '', 'Heading 2'),
    h3: () => insertTextAtSelection(textarea, '\n### ', '', 'Heading 3'),
    h4: () => insertTextAtSelection(textarea, '\n#### ', '', 'Heading 4'),
    h5: () => insertTextAtSelection(textarea, '\n##### ', '', 'Heading 5'),
    h6: () => insertTextAtSelection(textarea, '\n###### ', '', 'Heading 6'),
    bold: () => insertTextAtSelection(textarea, '**', '**', 'bold text'),
    italic: () => insertTextAtSelection(textarea, '*', '*', 'italic text'),
    quote: () => insertTextAtSelection(textarea, '\n> ', '', 'quoted text'),
    inlineCode: () => insertTextAtSelection(textarea, '`', '`', 'inline code'),
    codeBlock: () => insertTextAtSelection(textarea, '\n```ts\n', '\n```\n', 'console.log("hello");'),
    unorderedList: () => insertTextAtSelection(textarea, '\n- ', '', 'list item'),
    orderedList: () => insertTextAtSelection(textarea, '\n1. ', '', 'list item'),
    link: () => insertTextAtSelection(textarea, '[', '](https://example.com)', 'link text'),
    table: () => insertTextAtSelection(textarea, '', ''),
  };

  const next = actionMap[action]();
  emitValue(next.value);
  focusTextareaSelection(next.selectionStart, next.selectionEnd);
}
</script>

<template>
  <div class="admin-card overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-3" :class="toolbarClass">
      <MarkdownToolbar
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

    <div class="grid min-h-[720px]" :class="viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'">
      <div v-if="viewMode !== 'preview'" :class="viewMode === 'split' ? 'border-r border-[var(--admin-border)]' : ''">
        <textarea
          ref="textareaRef"
          class="admin-editor-textarea h-full"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          @input="emitValue(($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <div v-if="viewMode !== 'edit'" :class="viewMode === 'preview' ? '' : 'bg-white'">
        <article class="article-content admin-markdown-preview mx-auto max-w-none px-6 py-6" v-html="previewHtml" />
      </div>
    </div>

    <MediaPickerDialog
      :open="mediaPickerOpen"
      :title="mediaPickerTitle"
      empty-message="No images are available yet. Upload one from this dialog to use it in the editor."
      search-placeholder="Search media library images"
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
  </div>
</template>
