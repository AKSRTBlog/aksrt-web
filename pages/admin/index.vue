<script setup lang="ts">
import type {
  AdminApiProfile,
  AdminCommentItem,
  ArticleSummaryItem,
  MediaAssetItem,
  PaginatedResponse,
} from '~/types/admin';
import { AdminApiError, useAdminSession } from '~/composables/useAdminSession';
import { adminPaths, formatAdminDate, formatAdminNumber } from '~/utils/admin';

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

useHead({
  title: 'Admin Dashboard',
});

const { adminApiFetch, logout, hydrateSession } = useAdminSession();

const loading = ref(true);
const errorMessage = ref('');
const dashboardState = reactive<{
  articles: ArticleSummaryItem[]
  comments: AdminCommentItem[]
  media: MediaAssetItem[]
  profile: AdminApiProfile | null
}>({
  articles: [],
  comments: [],
  media: [],
  profile: null,
});

async function fetchAllPages<T>(path: string) {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await adminApiFetch<PaginatedResponse<T>>(`${path}?page=${page}&pageSize=100`);
    items.push(...result.list);
    totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
    page += 1;
  }

  return items;
}

const metrics = computed(() => {
  const publishedArticles = dashboardState.articles.filter((item) => item.status === 'published').length;
  const draftArticles = dashboardState.articles.filter((item) => item.status === 'draft').length;
  const pendingComments = dashboardState.comments.filter((item) => item.status === 'pending').length;
  const activeMedia = dashboardState.media.filter((item) => item.status === 'active').length;

  return [
    { marker: '文', label: '文章总数', value: formatAdminNumber(dashboardState.articles.length), change: `${publishedArticles} 已发布` },
    { marker: '发', label: '已发布文章', value: formatAdminNumber(publishedArticles), change: `${draftArticles} 草稿` },
    { marker: '评', label: '待审核评论', value: formatAdminNumber(pendingComments), change: '需要处理' },
    { marker: '媒', label: '媒体资源', value: formatAdminNumber(activeMedia), change: `${dashboardState.media.length} 总计` },
  ];
});

const recentArticles = computed(() =>
  [...dashboardState.articles].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 3),
);

const recentComments = computed(() =>
  [...dashboardState.comments].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 3),
);

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = '';
  hydrateSession();

  try {
    const [articles, comments, media, profile] = await Promise.all([
      fetchAllPages<ArticleSummaryItem>('/api/v1/admin/articles'),
      fetchAllPages<AdminCommentItem>('/api/v1/admin/comments'),
      fetchAllPages<MediaAssetItem>('/api/v1/admin/media'),
      adminApiFetch<AdminApiProfile>('/api/v1/admin/auth/me'),
    ]);

    dashboardState.articles = articles;
    dashboardState.comments = comments;
    dashboardState.media = media;
    dashboardState.profile = profile;
  } catch (error) {
    if (error instanceof AdminApiError && error.status === 401) {
      logout();
      await navigateTo(adminPaths.login);
      return;
    }

    errorMessage.value = error instanceof Error ? error.message : '仪表盘加载失败，请稍后重试。';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await loadDashboard();
});
</script>

<template>
  <div class="w-full max-w-full space-y-6 overflow-x-hidden">
    <AdminPageHeader title="仪表盘" description="查看文章、评论和媒体资源的最新状态。">
      <template #actions>
        <NuxtLink class="admin-button-primary" :to="adminPaths.articleCreate">新建文章</NuxtLink>
        <NuxtLink class="admin-button-secondary" :to="adminPaths.media">上传媒体</NuxtLink>
      </template>
    </AdminPageHeader>

    <div
      v-if="loading"
      class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-white/80 px-5 py-8 text-sm text-slate-500"
    >
      正在加载仪表盘数据...
    </div>

    <div
      v-else-if="errorMessage"
      class="rounded-[4px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600"
    >
      {{ errorMessage }}
    </div>

    <template v-else>
      <section class="w-full grid gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        <AdminStatCard
          v-for="item in metrics"
          :key="item.label"
          :marker="item.marker"
          :label="item.label"
          :value="item.value"
          :change="item.change"
        />
      </section>

      <section class="w-full grid gap-6 lg:grid-cols-1 xl:grid-cols-2">
        <div class="w-full space-y-6">
          <div class="admin-card p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">快捷入口</h3>
              <span class="hidden shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400 sm:inline">Shortcuts</span>
            </div>
            <div class="grid gap-3">
              <NuxtLink
                class="flex items-center justify-between gap-3 rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                :to="adminPaths.comments"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">评论管理</p>
                  <p class="mt-0.5 hidden text-xs text-slate-500 sm:block">审核、通过或处理最新评论。</p>
                </div>
                <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>

              <NuxtLink
                class="flex items-center justify-between gap-3 rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                :to="adminPaths.banners"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">Banner 管理</p>
                  <p class="mt-0.5 hidden text-xs text-slate-500 sm:block">维护首页与侧边栏的展示内容。</p>
                </div>
                <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>

              <NuxtLink
                class="flex items-center justify-between gap-3 rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4 transition hover:border-blue-200 hover:bg-blue-50/50"
                :to="adminPaths.settings"
              >
                <div>
                  <p class="text-sm font-semibold text-slate-900">站点设置</p>
                  <p class="mt-0.5 hidden text-xs text-slate-500 sm:block">修改 SEO、SMTP 与存储配置。</p>
                </div>
                <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </NuxtLink>
            </div>
          </div>

          <div class="admin-card p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">后台概览</h3>
              <span class="truncate text-xs text-slate-500 sm:text-sm">
                {{ dashboardState.profile?.displayName || dashboardState.profile?.username || '管理员' }}
              </span>
            </div>
            <div class="space-y-3 sm:space-y-4">
              <div class="rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4">
                <p class="text-xs text-slate-500">登录账号</p>
                <p class="mt-1 truncate text-sm font-medium text-slate-900">
                  {{ dashboardState.profile?.email || '未获取到邮箱' }}
                </p>
              </div>
              <div class="rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4">
                <p class="text-xs text-slate-500">最后登录</p>
                <p class="mt-1 text-sm font-medium text-slate-900">
                  {{ dashboardState.profile?.lastLoginAt ? formatAdminDate(dashboardState.profile.lastLoginAt) : '暂无记录' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="w-full space-y-6">
          <div class="admin-card p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">最新文章</h3>
              <NuxtLink class="text-sm font-medium text-blue-600" :to="adminPaths.articles">查看全部</NuxtLink>
            </div>

            <div v-if="recentArticles.length" class="space-y-3">
              <div
                v-for="article in recentArticles"
                :key="article.id"
                class="flex items-center gap-3 rounded-[4px] border border-[var(--admin-border)] px-3 py-2.5 sm:gap-4 sm:px-4 sm:py-3"
              >
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-900">{{ article.title }}</p>
                  <p class="mt-0.5 truncate text-xs text-slate-500">
                    {{ article.categories?.[0]?.name || '未分类' }} · {{ formatAdminDate(article.createdAt) }}
                  </p>
                </div>
                <AdminStatusBadge :tone="article.status === 'published' ? 'success' : 'warning'">
                  {{ article.status === 'published' ? '已发布' : '草稿' }}
                </AdminStatusBadge>
              </div>
            </div>

            <div v-else class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5">
              <p class="text-sm font-semibold text-slate-900">暂无文章</p>
              <p class="mt-1 text-sm text-slate-500">先创建第一篇文章后，这里会显示最近更新。</p>
            </div>
          </div>

          <div class="admin-card p-4 sm:p-6">
            <div class="mb-4 flex items-center justify-between gap-2">
              <h3 class="text-base font-semibold text-slate-900 sm:text-lg">最新评论</h3>
              <NuxtLink class="text-sm font-medium text-blue-600" :to="adminPaths.comments">查看全部</NuxtLink>
            </div>

            <div v-if="recentComments.length" class="space-y-3">
              <div
                v-for="comment in recentComments"
                :key="comment.id"
                class="rounded-[4px] border border-[var(--admin-border)] px-3 py-3 sm:px-4 sm:py-4"
              >
                <div class="flex items-center justify-between gap-2">
                  <p class="min-w-0 truncate text-sm font-semibold text-slate-900">{{ comment.nickname }}</p>
                  <AdminStatusBadge
                    :tone="
                      comment.status === 'approved'
                        ? 'success'
                        : comment.status === 'pending'
                          ? 'warning'
                          : 'danger'
                    "
                  >
                    {{ comment.status }}
                  </AdminStatusBadge>
                </div>
                <p class="mt-2 line-clamp-2 text-sm text-slate-500 sm:line-clamp-3">{{ comment.content }}</p>
                <p class="mt-1.5 text-xs text-slate-400 sm:mt-2">{{ formatAdminDate(comment.createdAt) }}</p>
              </div>
            </div>

            <div v-else class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5">
              <p class="text-sm font-semibold text-slate-900">暂无评论</p>
              <p class="mt-1 text-sm text-slate-500">有新评论后，这里会显示最近留言。</p>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
