<script setup lang="ts">
import type { ArticleEditorOptions, ArticleSummaryItem, PaginatedResponse } from '~/types/admin';
import { AdminApiError, useAdminSession } from '~/composables/useAdminSession';
import { adminPaths, formatAdminDate } from '~/utils/admin';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

useHead({
  title: 'Admin Articles',
});

const PAGE_SIZE = 6;

const { adminApiFetch, logout, hydrateSession } = useAdminSession();

const items = ref<ArticleSummaryItem[]>([]);
const options = ref<ArticleEditorOptions>({ categories: [], tags: [] });
const keyword = ref('');
const status = ref<'all' | 'published' | 'draft'>('all');
const categoryId = ref('all');
const page = ref(1);
const total = ref(0);
const loading = ref(true);
const errorMessage = ref('');
const busyId = ref<string | null>(null);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));

function buildArticleListPath() {
  const params = new URLSearchParams({
    page: String(page.value),
    pageSize: String(PAGE_SIZE),
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  if (keyword.value.trim()) {
    params.set('keyword', keyword.value.trim());
  }

  if (status.value !== 'all') {
    params.set('status', status.value);
  }

  if (categoryId.value !== 'all') {
    params.set('categoryId', categoryId.value);
  }

  return `/api/v1/admin/articles?${params.toString()}`;
}

async function loadArticles() {
  loading.value = true;
  errorMessage.value = '';
  hydrateSession();

  try {
    const [articleResult, optionResult] = await Promise.all([
      adminApiFetch<PaginatedResponse<ArticleSummaryItem>>(buildArticleListPath()),
      adminApiFetch<ArticleEditorOptions>('/api/v1/admin/articles/meta/options'),
    ]);

    items.value = articleResult.list;
    total.value = articleResult.total;
    options.value = optionResult;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      logout();
      await navigateTo(adminPaths.login);
      return;
    }

    errorMessage.value = error instanceof Error ? error.message : '文章列表加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

async function handleDelete(article: ArticleSummaryItem) {
  if (!window.confirm(`确定删除文章《${article.title}》吗？`)) {
    return;
  }

  busyId.value = article.id;
  errorMessage.value = '';

  try {
    await adminApiFetch(`/api/v1/admin/articles/${article.id}`, {
      method: 'DELETE',
    });

    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1;
      await loadArticles();
      return;
    }

    items.value = items.value.filter((item) => item.id !== article.id);
    total.value = Math.max(0, total.value - 1);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '删除文章失败，请稍后重试。';
  } finally {
    busyId.value = null;
  }
}

watch([page, keyword, status, categoryId], async () => {
  await loadArticles();
});

onMounted(async () => {
  await loadArticles();
});
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="文章管理"
      description="在这里浏览真实文章数据，按关键词、状态和分类筛选，并进入编辑或删除。"
    >
      <template #actions>
        <NuxtLink class="admin-button-primary" :to="adminPaths.articleCreate">新建文章</NuxtLink>
      </template>
    </AdminPageHeader>

    <div class="rounded-lg border border-[var(--admin-border)] bg-white p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <AdminSearchField
          v-model="keyword"
          placeholder="搜索标题或摘要"
          @update:modelValue="page = 1"
        />

        <div class="flex flex-wrap gap-2">
          <select v-model="status" class="admin-select w-auto min-w-36" @change="page = 1">
            <option value="all">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
          </select>

          <select v-model="categoryId" class="admin-select w-auto min-w-40" @change="page = 1">
            <option value="all">全部分类</option>
            <option v-for="item in options.categories" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
    >
      {{ errorMessage }}
    </div>

    <div class="admin-card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left">
              <th
                v-for="label in ['文章', '分类', '状态', '发布时间', '更新时间', '操作']"
                :key="label"
                class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"
              >
                {{ label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td class="px-5 py-10 text-sm text-slate-400" colspan="6">
                正在加载文章数据...
              </td>
            </tr>

            <tr v-else-if="items.length === 0">
              <td class="px-5 py-10 text-sm text-slate-400" colspan="6">
                当前筛选条件下还没有文章。
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="article in items"
                :key="article.id"
                class="border-b border-[var(--admin-border)] transition hover:bg-slate-50"
              >
                <td class="px-5 py-4">
                  <div class="flex min-w-[260px] items-center gap-4">
                    <img
                      v-if="article.coverImageUrl"
                      class="h-14 w-14 rounded-[4px] object-cover"
                      :src="article.coverImageUrl"
                      :alt="article.title"
                    />
                    <div
                      v-else
                      class="flex h-14 w-14 items-center justify-center rounded-[4px] bg-slate-100 text-xs text-slate-400"
                    >
                      无封面
                    </div>

                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-slate-900">{{ article.title }}</p>
                      <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{{ article.excerpt }}</p>
                    </div>
                  </div>
                </td>

                <td class="px-5 py-4 text-sm text-slate-600">
                  {{
                    article.categories && article.categories.length > 0
                      ? article.categories.map((cat) => cat.name).join(', ')
                      : '未分类'
                  }}
                </td>

                <td class="px-5 py-4">
                  <AdminStatusBadge :tone="article.status === 'published' ? 'success' : 'warning'">
                    {{ article.status === 'published' ? '已发布' : '草稿' }}
                  </AdminStatusBadge>
                </td>

                <td class="px-5 py-4 text-sm text-slate-600">
                  {{ article.publishedAt ? formatAdminDate(article.publishedAt) : '未发布' }}
                </td>

                <td class="px-5 py-4 text-sm text-slate-600">{{ formatAdminDate(article.updatedAt) }}</td>

                <td class="px-5 py-4">
                  <div class="flex flex-wrap gap-2">
                    <NuxtLink
                      class="admin-button-secondary"
                      :to="`/articles/${article.slug}`"
                      target="_blank"
                    >
                      预览
                    </NuxtLink>
                    <NuxtLink class="admin-button-secondary" :to="adminPaths.articleEdit(article.id)">
                      编辑
                    </NuxtLink>
                    <button
                      class="admin-button-danger"
                      type="button"
                      :disabled="busyId === article.id"
                      @click="handleDelete(article)"
                    >
                      {{ busyId === article.id ? '删除中...' : '删除' }}
                    </button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <AdminPagination
        :page="Math.min(page, totalPages)"
        :total="total"
        :total-pages="totalPages"
        label="篇文章"
        @update:page="page = $event"
      />
    </div>
  </div>
</template>
