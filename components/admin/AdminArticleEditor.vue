<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import MediaPickerDialog from '~/components/admin/MediaPickerDialog.vue';
import { AdminApiError, useAdminSession } from '~/composables/useAdminSession';
import type {
  ArticleDetailItem,
  ArticleEditorOptions,
  MediaAssetItem,
} from '~/types/admin';
import {
  type ArticleEditorForm,
  buildArticlePayload,
  clearDraftSnapshot,
  countWords,
  createEmptyArticleForm,
  estimateReadingTime,
  loadDraftSnapshot,
  mapArticleToEditorForm,
  saveDraftSnapshot,
  sanitizeArticleSlug,
} from '~/utils/admin-editor';
import { adminPaths, adminText, formatAdminDate, getAdminArticleStatusLabel } from '~/utils/admin';

const props = defineProps<{
  articleId?: string
}>();

const { adminApiFetch, logout, hydrateSession } = useAdminSession();
const { invalidatePublicData } = usePublicDataInvalidation();

const isEditing = computed(() => Boolean(props.articleId));
const draftKey = computed(() => props.articleId ?? 'new');

const coverPickerOpen = ref(false);

const form = ref<ArticleEditorForm>(createEmptyArticleForm());
const options = ref<ArticleEditorOptions>({ categories: [], tags: [] });
const loading = ref(true);
const errorMessage = ref('');
const successMessage = ref('');
const recoveredDraft = ref(false);
const persistedUpdatedAt = ref<string | null>(null);
const actionState = ref<
  null | 'local-draft' | 'save-draft' | 'publish'
>(null);

const wordCount = computed(() => countWords(form.value.contentMarkdown));
const readingTime = computed(() => estimateReadingTime(form.value.contentMarkdown));
const resolvedSlug = computed(() => (isEditing.value ? form.value.slug : ''));
const statusDisplay = computed(() => getAdminArticleStatusLabel(form.value.status));

const selectedCategories = computed(() =>
  options.value.categories.filter((item) => form.value.categoryIds.includes(item.id)),
);

const selectedTags = computed(() =>
  options.value.tags.filter((item) => form.value.tagIds.includes(item.id)),
);

function updateForm(patch: Partial<ArticleEditorForm>) {
  form.value = {
    ...form.value,
    ...patch,
  };
}

async function loadEditor() {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  recoveredDraft.value = false;
  hydrateSession();

  try {
    const [optionResult, articleResult] = await Promise.all([
      adminApiFetch<ArticleEditorOptions>('/api/v1/admin/articles/meta/options'),
      props.articleId
        ? adminApiFetch<ArticleDetailItem>(`/api/v1/admin/articles/${props.articleId}`)
        : Promise.resolve<ArticleDetailItem | null>(null),
    ]);

    options.value = optionResult;
    persistedUpdatedAt.value = articleResult?.updatedAt ?? null;

    const baseForm = articleResult
      ? mapArticleToEditorForm(articleResult)
      : createEmptyArticleForm(optionResult.categories[0]?.id);

    const cachedDraft = loadDraftSnapshot(draftKey.value);
    form.value = cachedDraft ?? baseForm;
    recoveredDraft.value = Boolean(cachedDraft);

    if (!form.value.categoryIds.length && optionResult.categories[0]?.id) {
      form.value.categoryIds = [optionResult.categories[0].id];
    }
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      logout();
      await navigateTo(adminPaths.login);
      return;
    }

    errorMessage.value = error instanceof Error ? error.message : '加载文章编辑器失败。';
  } finally {
    loading.value = false;
  }
}

function applyCoverSelection(asset: MediaAssetItem) {
  errorMessage.value = '';
  updateForm({
    cover: {
      url: asset.url,
      objectKey: asset.filename,
      fileName: asset.originalFilename,
      mimeType: asset.mimeType,
    },
  });
  successMessage.value = '封面已选择。';
  coverPickerOpen.value = false;
}

function validateBeforeSave() {
  if (!form.value.title.trim()) {
    errorMessage.value = '标题不能为空。';
    return false;
  }

  if (!form.value.contentMarkdown.trim()) {
    errorMessage.value = '正文内容不能为空。';
    return false;
  }

  if (!form.value.categoryIds.length) {
    errorMessage.value = '请至少选择一个分类。';
    return false;
  }

  return true;
}

async function saveArticle(targetStatus: 'draft' | 'published') {
  if (!validateBeforeSave()) {
    return;
  }

  actionState.value = targetStatus === 'draft' ? 'save-draft' : 'publish';
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const payload = buildArticlePayload(form.value, targetStatus, isEditing.value);

    const saved = isEditing.value
      ? await adminApiFetch<ArticleDetailItem>(`/api/v1/admin/articles/${props.articleId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        })
      : await adminApiFetch<ArticleDetailItem>('/api/v1/admin/articles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

    clearDraftSnapshot(draftKey.value);
    form.value = mapArticleToEditorForm(saved);
    persistedUpdatedAt.value = saved.updatedAt;
    invalidatePublicData();
    successMessage.value = targetStatus === 'draft' ? '草稿已保存。' : '文章已发布。';

    if (!isEditing.value) {
      await navigateTo(adminPaths.articleEdit(saved.id));
      return;
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '文章保存失败。';
  } finally {
    actionState.value = null;
  }
}

function saveLocalDraft() {
  saveDraftSnapshot(draftKey.value, form.value);
  successMessage.value = '本地草稿已保存。';
}

function toggleCategory(categoryId: string) {
  const active = form.value.categoryIds.includes(categoryId);
  updateForm({
    categoryIds: active
      ? form.value.categoryIds.filter((id) => id !== categoryId)
      : [...form.value.categoryIds, categoryId],
  });
}

function toggleTag(tagId: string) {
  const active = form.value.tagIds.includes(tagId);
  updateForm({
    tagIds: active
      ? form.value.tagIds.filter((id) => id !== tagId)
      : [...form.value.tagIds, tagId],
  });
}

function handleTitleInput(event: Event) {
  updateForm({ title: (event.target as HTMLInputElement).value });
}

function handleExcerptInput(event: Event) {
  updateForm({ excerpt: (event.target as HTMLTextAreaElement).value });
}

function handleSlugInput(event: Event) {
  updateForm({ slug: sanitizeArticleSlug((event.target as HTMLInputElement).value) });
}

function handleStatusInput(event: Event) {
  updateForm({
    status: (event.target as HTMLSelectElement).value as ArticleEditorForm['status'],
  });
}

function handleDateInput(event: Event) {
  const value = (event.target as HTMLInputElement).value;
  updateForm(form.value.status === 'scheduled' ? { scheduledAt: value } : { publishedAt: value });
}

onMounted(async () => {
  await loadEditor();
});
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      :title="isEditing ? '编辑文章' : '新建文章'"
      :description="
        isEditing
          ? '修改标题、摘要、Markdown 正文和发布设置。'
          : '创建一篇新文章草稿，或直接发布。'
      "
    >
      <template #actions>
        <NuxtLink class="admin-button-secondary" :to="adminPaths.articles">返回文章列表</NuxtLink>
        <button class="admin-button-secondary" type="button" @click="saveLocalDraft">
          保存本地草稿
        </button>
        <button class="admin-button-secondary" type="button" :disabled="Boolean(actionState)" @click="saveArticle('draft')">
          {{ actionState === 'save-draft' ? '保存中...' : '保存草稿' }}
        </button>
        <button class="admin-button-primary" type="button" :disabled="Boolean(actionState)" @click="saveArticle('published')">
          {{ actionState === 'publish' ? '发布中...' : (isEditing ? '更新并发布' : '立即发布') }}
        </button>
      </template>
    </AdminPageHeader>

    <div v-if="recoveredDraft" class="rounded-[4px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
      已为当前文章恢复本地草稿。
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
      正在加载编辑器...
    </div>

    <template v-else>
      <section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div class="space-y-6">
          <div class="admin-card p-5">
            <div class="grid gap-4 lg:grid-cols-2">
              <label class="block lg:col-span-2">
                <span class="mb-2 block text-sm font-medium text-slate-700">标题</span>
                <input class="admin-input" :value="form.title" placeholder="请输入文章标题" @input="handleTitleInput" />
              </label>

              <label class="block lg:col-span-2">
                <span class="mb-2 block text-sm font-medium text-slate-700">摘要</span>
                <textarea
                  class="admin-textarea min-h-28"
                  :value="form.excerpt"
                  placeholder="请输入文章摘要"
                  @input="handleExcerptInput"
                />
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">
                  别名{{ isEditing ? '' : '（发布时自动生成）' }}
                </span>
                <input
                  class="admin-input"
                  :value="resolvedSlug"
                  :disabled="!isEditing"
                  :placeholder="isEditing ? '请输入文章别名' : '发布时自动生成'"
                  @input="handleSlugInput"
                />
              </label>

              <div class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50 px-4 py-3">
                <p class="text-sm font-medium text-slate-900">写作统计</p>
                <div class="mt-2 space-y-1 text-sm text-slate-500">
                  <p>字数：{{ wordCount }}</p>
                  <p>阅读时长：{{ readingTime }} 分钟</p>
                  <p>状态：{{ statusDisplay }}</p>
                </div>
              </div>
            </div>
          </div>

          <section class="admin-card overflow-hidden p-0">
            <div class="flex items-center justify-between border-b border-[var(--admin-border)] bg-amber-50/50 px-5 py-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">文章内容</span>
                <span class="text-rose-500">*</span>
              </div>
              <span class="text-xs text-slate-500">使用 Markdown 编写文章正文。</span>
            </div>

            <AdminMarkdownEditor
              v-model="form.contentMarkdown"
              :disabled="Boolean(actionState)"
              placeholder="在这里编写 Markdown 内容..."
              preview-placeholder="## 开始编写\n\n这里会实时显示预览效果。"
              upload-usage="article_content"
              media-picker-title="选择正文图片"
            />
          </section>
        </div>

        <aside class="space-y-6">
          <div class="admin-card p-5">
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-slate-900">封面图片</p>
                <p class="mt-1 text-sm text-slate-500">从媒体库中选择，或上传新的封面图片。</p>
              </div>
              <button class="admin-button-secondary" type="button" @click="coverPickerOpen = true">
                选择封面
              </button>
            </div>

            <div v-if="form.cover" class="mt-4 overflow-hidden rounded-[4px] bg-slate-100">
              <AppImage class="aspect-[16/10] w-full object-cover" :src="form.cover.url" :alt="form.cover.fileName" loading="eager" />
            </div>
            <button v-else class="admin-upload-dropzone mt-4" type="button" @click="coverPickerOpen = true">
              打开媒体库
            </button>

            <div v-if="form.cover" class="mt-4 space-y-2 text-xs text-slate-500">
              <p>文件：{{ form.cover.fileName }}</p>
              <p class="break-all">地址：{{ form.cover.url }}</p>
              <button class="admin-button-danger mt-2" type="button" @click="updateForm({ cover: null })">
                移除封面
              </button>
            </div>
          </div>

          <div class="admin-card p-5">
            <h3 class="text-sm font-semibold text-slate-900">发布设置</h3>
            <div class="mt-4 space-y-5">
              <div>
                <span class="mb-2 block text-sm font-medium text-slate-700">分类</span>
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
                <span class="mb-2 block text-sm font-medium text-slate-700">标签</span>
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
                <span class="mb-2 block text-sm font-medium text-slate-700">状态</span>
                <select class="admin-select" :value="form.status" @change="handleStatusInput">
                  <option value="draft">草稿</option>
                  <option value="published">已发布</option>
                  <option value="scheduled">定时发布</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-medium text-slate-700">
                  {{ form.status === 'scheduled' ? '定时发布时间' : '发布时间' }}
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
                  <p class="text-sm font-medium text-slate-900">允许评论</p>
                  <p class="mt-1 text-xs text-slate-500">如果这篇文章不希望继续接收评论，可以关闭。</p>
                </div>
                <button :class="form.allowComments ? 'admin-switch admin-switch-on' : 'admin-switch'" type="button" @click="updateForm({ allowComments: !form.allowComments })">
                  <span class="admin-switch-thumb" />
                </button>
              </label>

              <div class="rounded-[4px] bg-slate-50 p-4">
                <div class="text-sm font-medium text-slate-900">文章概览</div>
                <div class="mt-3 space-y-2 text-sm text-slate-500">
                  <p>分类：{{ selectedCategories.length ? selectedCategories.map((item) => item.name).join(' / ') : adminText.unselected }}</p>
                  <p>标签：{{ selectedTags.length ? selectedTags.map((item) => item.name).join(' / ') : adminText.unselected }}</p>
                  <p>状态：{{ statusDisplay }}</p>
                  <p>别名：{{ resolvedSlug || adminText.notSet }}</p>
                  <p v-if="persistedUpdatedAt">更新时间：{{ formatAdminDate(persistedUpdatedAt) }}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </template>

    <MediaPickerDialog
      :open="coverPickerOpen"
      title="选择封面图片"
      empty-message="当前还没有可用图片，可以在这里上传后用作文章封面。"
      search-placeholder="搜索媒体库图片"
      upload-usage="article_cover"
      @close="coverPickerOpen = false"
      @select="applyCoverSelection"
    />
  </div>
</template>
