<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import MediaPickerDialog from '~/components/admin/MediaPickerDialog.vue';
import { renderMarkdown } from '~/composables/api';
import { AdminApiError, useAdminSession } from '~/composables/useAdminSession';
import type {
  ArticleDetailItem,
  ArticleEditorOptions,
  MediaAssetItem,
} from '~/types/admin';
import {
  type ArticleEditorForm,
  type EditorViewMode,
  buildArticlePayload,
  buildMarkdownTable,
  clearDraftSnapshot,
  countWords,
  createEmptyArticleForm,
  estimateReadingTime,
  insertTextAtSelection,
  loadDraftSnapshot,
  mapArticleToEditorForm,
  saveDraftSnapshot,
  sanitizeArticleSlug,
  slugifyArticleTitle,
} from '~/utils/admin-editor';
import { adminPaths, formatAdminDate } from '~/utils/admin';

type MediaPickerMode = 'cover' | 'inline'

const props = defineProps<{
  articleId?: string
}>()

const { adminApiFetch, logout, hydrateSession } = useAdminSession();

const isEditing = computed(() => Boolean(props.articleId))
const draftKey = computed(() => props.articleId ?? 'new')

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const mediaPickerMode = ref<MediaPickerMode | null>(null)

const form = ref<ArticleEditorForm>(createEmptyArticleForm())
const options = ref<ArticleEditorOptions>({ categories: [], tags: [] })
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const recoveredDraft = ref(false)
const persistedUpdatedAt = ref<string | null>(null)
const viewMode = ref<EditorViewMode>('split')
const actionState = ref<
  null | 'local-draft' | 'save-draft' | 'publish'
>(null)

const previewHtml = computed(() => renderMarkdown(form.value.contentMarkdown))
const wordCount = computed(() => countWords(form.value.contentMarkdown))
const readingTime = computed(() => estimateReadingTime(form.value.contentMarkdown))
const resolvedSlug = computed(() =>
  isEditing.value ? form.value.slug : slugifyArticleTitle(form.value.title),
)

const selectedCategories = computed(() =>
  options.value.categories.filter((item) => form.value.categoryIds.includes(item.id)),
)

const selectedTags = computed(() =>
  options.value.tags.filter((item) => form.value.tagIds.includes(item.id)),
)

function updateForm(patch: Partial<ArticleEditorForm>) {
  form.value = {
    ...form.value,
    ...patch,
  }
}

async function loadEditor() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  recoveredDraft.value = false
  hydrateSession()

  try {
    const [optionResult, articleResult] = await Promise.all([
      adminApiFetch<ArticleEditorOptions>('/api/v1/admin/articles/meta/options'),
      props.articleId
        ? adminApiFetch<ArticleDetailItem>(`/api/v1/admin/articles/${props.articleId}`)
        : Promise.resolve<ArticleDetailItem | null>(null),
    ])

    options.value = optionResult
    persistedUpdatedAt.value = articleResult?.updatedAt ?? null

    const baseForm = articleResult
      ? mapArticleToEditorForm(articleResult)
      : createEmptyArticleForm(optionResult.categories[0]?.id)

    const cachedDraft = loadDraftSnapshot(draftKey.value)
    form.value = cachedDraft ?? baseForm
    recoveredDraft.value = Boolean(cachedDraft)

    if (!form.value.categoryIds.length && optionResult.categories[0]?.id) {
      form.value.categoryIds = [optionResult.categories[0].id]
    }
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      logout()
      await navigateTo(adminPaths.login)
      return
    }

    errorMessage.value = error instanceof Error ? error.message : 'Failed to load article editor.'
  } finally {
    loading.value = false
  }
}

function focusTextareaSelection(selectionStart: number, selectionEnd: number) {
  nextTick(() => {
    if (!textareaRef.value) {
      return
    }

    textareaRef.value.focus()
    textareaRef.value.setSelectionRange(selectionStart, selectionEnd)
  })
}

function applyInsertion(
  builder: (textarea: HTMLTextAreaElement) => {
    value: string
    selectionStart: number
    selectionEnd: number
  },
) {
  if (!textareaRef.value) {
    viewMode.value = 'edit'
    successMessage.value = 'Switched to edit mode. Click the toolbar action again.'
    return
  }

  const next = builder(textareaRef.value)
  updateForm({ contentMarkdown: next.value })
  focusTextareaSelection(next.selectionStart, next.selectionEnd)
}

function handleToolbarAction(action: string) {
  const textarea = textareaRef.value

  if (!textarea) {
    viewMode.value = 'edit'
    successMessage.value = 'Switched to edit mode. Click the toolbar action again.'
    return
  }

  const actionMap: Record<string, () => ReturnType<typeof insertTextAtSelection>> = {
    h1: () => insertTextAtSelection(textarea, '\n# ', '', 'Heading 1'),
    h2: () => insertTextAtSelection(textarea, '\n## ', '', 'Heading 2'),
    h3: () => insertTextAtSelection(textarea, '\n### ', '', 'Heading 3'),
    bold: () => insertTextAtSelection(textarea, '**', '**', 'bold text'),
    italic: () => insertTextAtSelection(textarea, '*', '*', 'italic text'),
    quote: () => insertTextAtSelection(textarea, '\n> ', '', 'quoted text'),
    code: () => insertTextAtSelection(textarea, '\n```ts\n', '\n```\n', 'console.log("hello");'),
    list: () => insertTextAtSelection(textarea, '\n- ', '', 'list item'),
    link: () => insertTextAtSelection(textarea, '[', '](https://example.com)', 'link text'),
  }

  const actionBuilder = actionMap[action]

  if (!actionBuilder) {
    return
  }

  const next = actionBuilder()
  updateForm({ contentMarkdown: next.value })
  focusTextareaSelection(next.selectionStart, next.selectionEnd)
}

function handleInsertTable() {
  const rows = Number(window.prompt('Rows', '3') || '3')
  const columns = Number(window.prompt('Columns', '3') || '3')
  const tableMarkdown = buildMarkdownTable(rows, columns)

  applyInsertion((textarea) => insertTextAtSelection(textarea, '\n', `\n${tableMarkdown}\n`))
}

function handleInsertExternalImage() {
  const url = window.prompt('Image URL', 'https://')

  if (!url?.trim()) {
    return
  }

  applyInsertion((textarea) => insertTextAtSelection(textarea, `![image](${url.trim()})`, ''))
}

function openMediaPicker(mode: MediaPickerMode) {
  errorMessage.value = ''

  if (mode === 'inline' && viewMode.value === 'preview') {
    viewMode.value = 'split'
  }

  mediaPickerMode.value = mode
}

function closeMediaPicker() {
  mediaPickerMode.value = null
}

function resolveInlineImageAltText(asset: MediaAssetItem) {
  const candidate = asset.altText?.trim() || asset.title.trim() || asset.originalFilename.trim() || 'image'
  return candidate.replace(/[\r\n]+/g, ' ').replace(/[[\]]/g, '').trim() || 'image'
}

function insertInlineImage(asset: MediaAssetItem) {
  const performInsert = () => {
    if (!textareaRef.value) {
      errorMessage.value = 'Editor is not ready for image insertion.'
      return
    }

    const altText = resolveInlineImageAltText(asset)
    applyInsertion((textarea) => insertTextAtSelection(textarea, `\n![${altText}](`, ')\n', asset.url))
    successMessage.value = 'Image inserted.'
  }

  if (!textareaRef.value) {
    viewMode.value = 'split'
    nextTick(performInsert)
    return
  }

  performInsert()
}

function applyMediaSelection(asset: MediaAssetItem) {
  errorMessage.value = ''

  if (mediaPickerMode.value === 'cover') {
    updateForm({
      cover: {
        url: asset.url,
        objectKey: asset.filename,
        fileName: asset.originalFilename,
        mimeType: asset.mimeType,
      },
    })
    successMessage.value = 'Cover selected.'
    closeMediaPicker()
    return
  }

  insertInlineImage(asset)
  closeMediaPicker()
}

function validateBeforeSave() {
  if (!form.value.title.trim()) {
    errorMessage.value = 'Title is required.'
    return false
  }

  if (!form.value.excerpt.trim()) {
    errorMessage.value = 'Excerpt is required.'
    return false
  }

  if (!form.value.contentMarkdown.trim()) {
    errorMessage.value = 'Content is required.'
    return false
  }

  if (!form.value.categoryIds.length) {
    errorMessage.value = 'Select at least one category.'
    return false
  }

  return true
}

async function saveArticle(targetStatus: 'draft' | 'published') {
  if (!validateBeforeSave()) {
    return
  }

  actionState.value = targetStatus === 'draft' ? 'save-draft' : 'publish'
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = buildArticlePayload(form.value, targetStatus, isEditing.value)

    const saved = isEditing.value
      ? await adminApiFetch<ArticleDetailItem>(`/api/v1/admin/articles/${props.articleId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await adminApiFetch<ArticleDetailItem>('/api/v1/admin/articles', {
          method: 'POST',
          body: JSON.stringify(payload),
        })

    clearDraftSnapshot(draftKey.value)
    form.value = mapArticleToEditorForm(saved)
    persistedUpdatedAt.value = saved.updatedAt
    successMessage.value = targetStatus === 'draft' ? 'Draft saved.' : 'Article published.'

    if (!isEditing.value) {
      await navigateTo(adminPaths.articleEdit(saved.id))
      return
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Article save failed.'
  } finally {
    actionState.value = null
  }
}

function saveLocalDraft() {
  saveDraftSnapshot(draftKey.value, form.value)
  successMessage.value = 'Local draft saved.'
}

function toggleCategory(categoryId: string) {
  const active = form.value.categoryIds.includes(categoryId)
  updateForm({
    categoryIds: active
      ? form.value.categoryIds.filter((id) => id !== categoryId)
      : [...form.value.categoryIds, categoryId],
  })
}

function toggleTag(tagId: string) {
  const active = form.value.tagIds.includes(tagId)
  updateForm({
    tagIds: active
      ? form.value.tagIds.filter((id) => id !== tagId)
      : [...form.value.tagIds, tagId],
  })
}

function handleTitleInput(event: Event) {
  updateForm({ title: (event.target as HTMLInputElement).value })
}

function handleExcerptInput(event: Event) {
  updateForm({ excerpt: (event.target as HTMLTextAreaElement).value })
}

function handleSlugInput(event: Event) {
  updateForm({ slug: sanitizeArticleSlug((event.target as HTMLInputElement).value) })
}

function handleContentInput(event: Event) {
  updateForm({ contentMarkdown: (event.target as HTMLTextAreaElement).value })
}

function handleStatusInput(event: Event) {
  updateForm({
    status: (event.target as HTMLSelectElement).value as ArticleEditorForm['status'],
  })
}

function handleDateInput(event: Event) {
  const value = (event.target as HTMLInputElement).value

  updateForm(form.value.status === 'scheduled' ? { scheduledAt: value } : { publishedAt: value })
}

onMounted(async () => {
  await loadEditor()
})
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      :title="isEditing ? 'Edit Article' : 'New Article'"
      :description="
        isEditing
          ? 'Update title, excerpt, markdown content, and publishing settings.'
          : 'Create a new article draft or publish it directly.'
      "
    >
      <template #actions>
        <NuxtLink class="admin-button-secondary" :to="adminPaths.articles">Back to Articles</NuxtLink>
        <button class="admin-button-secondary" type="button" @click="saveLocalDraft">
          Save Local Draft
        </button>
        <button class="admin-button-secondary" type="button" :disabled="Boolean(actionState)" @click="saveArticle('draft')">
          {{ actionState === 'save-draft' ? 'Saving...' : 'Save Draft' }}
        </button>
        <button class="admin-button-primary" type="button" :disabled="Boolean(actionState)" @click="saveArticle('published')">
          {{ actionState === 'publish' ? 'Publishing...' : (isEditing ? 'Update & Publish' : 'Publish') }}
        </button>
      </template>
    </AdminPageHeader>

    <div v-if="recoveredDraft" class="rounded-[4px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
      Local draft restored for this article.
    </div>

    <div v-if="errorMessage" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div
      v-if="loading"
      class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-white/80 px-5 py-10 text-sm text-slate-500"
    >
      Loading editor...
    </div>

    <template v-else>
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-6">
          <div class="admin-card p-5">
            <div class="grid gap-4 lg:grid-cols-2">
              <label class="block lg:col-span-2">
                <span class="mb-2 block text-sm font-medium text-slate-700">Title</span>
                <input class="admin-input" :value="form.title" placeholder="Article title" @input="handleTitleInput" />
              </label>

              <label class="block lg:col-span-2">
                <span class="mb-2 block text-sm font-medium text-slate-700">Excerpt</span>
                <textarea
                  class="admin-textarea min-h-28"
                  :value="form.excerpt"
                  placeholder="Article excerpt"
                  @input="handleExcerptInput"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">
                  Slug{{ isEditing ? '' : ' (auto generated on first save)' }}
                </span>
                <input
                  class="admin-input"
                  :value="resolvedSlug"
                  :disabled="!isEditing"
                  placeholder="Article slug"
                  @input="handleSlugInput"
                />
              </label>

              <div class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50 px-4 py-3">
                <p class="text-sm font-medium text-slate-900">Writing Stats</p>
                <div class="mt-2 space-y-1 text-sm text-slate-500">
                  <p>Words: {{ wordCount }}</p>
                  <p>Reading Time: {{ readingTime }} min</p>
                  <p>Status: {{ form.status }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="admin-card overflow-hidden">
            <div class="flex flex-wrap items-center gap-2 border-b border-[var(--admin-border)] bg-slate-50/90 px-4 py-3">
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('h1')">H1</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('h2')">H2</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('h3')">H3</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('bold')">Bold</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('italic')">Italic</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('quote')">Quote</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('code')">Code</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('list')">List</button>
              <button class="admin-toolbar-button" type="button" @click="handleToolbarAction('link')">Link</button>
              <button class="admin-toolbar-button" type="button" @click="handleInsertTable">Table</button>
              <button class="admin-toolbar-button" type="button" @click="handleInsertExternalImage">Image URL</button>
              <button
                class="admin-toolbar-button"
                type="button"
                @click="openMediaPicker('inline')"
              >
                Media Image
              </button>

              <div class="ml-auto flex flex-wrap gap-2">
                <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'edit' }" type="button" @click="viewMode = 'edit'">
                  Edit
                </button>
                <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'split' }" type="button" @click="viewMode = 'split'">
                  Split
                </button>
                <button class="admin-button-secondary" :class="{ 'admin-button-primary': viewMode === 'preview' }" type="button" @click="viewMode = 'preview'">
                  Preview
                </button>
              </div>
            </div>

            <div class="grid" :class="viewMode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'">
              <div v-if="viewMode !== 'preview'" class="h-[720px] overflow-y-auto" :class="viewMode === 'split' ? 'border-r border-[var(--admin-border)]' : ''">
                <textarea
                  ref="textareaRef"
                  class="admin-editor-textarea h-full"
                  :value="form.contentMarkdown"
                  placeholder="Write markdown content here..."
                  @input="handleContentInput"
                />
              </div>

              <div v-if="viewMode !== 'edit'" class="h-[720px] overflow-y-auto" :class="viewMode === 'preview' ? '' : 'bg-white'">
                <article class="article-content admin-markdown-preview mx-auto max-w-none px-6 py-6" v-html="previewHtml" />
              </div>
            </div>
          </div>
        </div>

        <aside class="space-y-6">
          <div class="admin-card p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">Cover Image</p>
                <p class="mt-1 text-sm text-slate-500">Choose from the media library or upload a new cover image.</p>
              </div>
              <button class="admin-button-secondary" type="button" @click="openMediaPicker('cover')">
                Choose Cover
              </button>
            </div>

            <div v-if="form.cover" class="mt-4 overflow-hidden rounded-[4px] bg-slate-100">
              <AppImage class="aspect-[16/10] w-full object-cover" :src="form.cover.url" :alt="form.cover.fileName" loading="eager" />
            </div>
            <button v-else class="admin-upload-dropzone mt-4" type="button" @click="openMediaPicker('cover')">
              Open Media Library
            </button>

            <div v-if="form.cover" class="mt-4 space-y-2 text-xs text-slate-500">
              <p>File: {{ form.cover.fileName }}</p>
              <p class="break-all">URL: {{ form.cover.url }}</p>
              <button class="admin-button-danger mt-2" type="button" @click="updateForm({ cover: null })">
                Remove Cover
              </button>
            </div>
          </div>

          <div class="admin-card p-5">
            <h3 class="text-sm font-semibold text-slate-900">Publishing</h3>
            <div class="mt-4 space-y-5">
              <div>
                <span class="mb-2 block text-sm font-medium text-slate-700">Categories</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="category in options.categories"
                    :key="category.id"
                    type="button"
                    :class="form.categoryIds.includes(category.id) ? 'admin-tag-button-active' : 'admin-tag-button'"
                    @click="toggleCategory(category.id)"
                  >
                    {{ category.name }}
                  </button>
                </div>
              </div>

              <div>
                <span class="mb-2 block text-sm font-medium text-slate-700">Tags</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in options.tags"
                    :key="tag.id"
                    type="button"
                    :class="form.tagIds.includes(tag.id) ? 'admin-tag-button-active' : 'admin-tag-button'"
                    @click="toggleTag(tag.id)"
                  >
                    #{{ tag.name }}
                  </button>
                </div>
              </div>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">Status</span>
                <select class="admin-select" :value="form.status" @change="handleStatusInput">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">
                  {{ form.status === 'scheduled' ? 'Scheduled At' : 'Published At' }}
                </span>
                <input
                  class="admin-input"
                  type="datetime-local"
                  :value="form.status === 'scheduled' ? form.scheduledAt ?? '' : form.publishedAt ?? ''"
                  @input="handleDateInput"
                />
              </label>

              <label class="flex items-center justify-between gap-4 rounded-[4px] border border-[var(--admin-border)] px-4 py-3">
                <div>
                  <p class="text-sm font-medium text-slate-900">Allow Comments</p>
                  <p class="mt-1 text-xs text-slate-500">Disable this if the article should not accept new comments.</p>
                </div>
                <button :class="form.allowComments ? 'admin-switch admin-switch-on' : 'admin-switch'" type="button" @click="updateForm({ allowComments: !form.allowComments })">
                  <span class="admin-switch-thumb" />
                </button>
              </label>

              <div class="rounded-[4px] bg-slate-50 p-4">
                <div class="text-sm font-medium text-slate-900">Article Summary</div>
                <div class="mt-3 space-y-2 text-sm text-slate-500">
                  <p>Categories: {{ selectedCategories.length ? selectedCategories.map((item) => item.name).join(' / ') : 'None' }}</p>
                  <p>Tags: {{ selectedTags.length ? selectedTags.map((item) => item.name).join(' / ') : 'None' }}</p>
                  <p>Slug: {{ resolvedSlug }}</p>
                  <p v-if="persistedUpdatedAt">Updated: {{ formatAdminDate(persistedUpdatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </template>

    <MediaPickerDialog
      :open="Boolean(mediaPickerMode)"
      :title="mediaPickerMode === 'cover' ? 'Choose Cover Image' : 'Choose Inline Image'"
      empty-message="No images are available yet. Upload one from this dialog to use it in the article."
      search-placeholder="Search media library images"
      :upload-usage="mediaPickerMode === 'cover' ? 'article_cover' : 'article_content'"
      @close="closeMediaPicker"
      @select="applyMediaSelection"
    />
  </div>
</template>
