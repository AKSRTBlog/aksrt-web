<script setup lang="ts">
import type { AdminCommentItem, AiCategoryDetail } from '~/types/admin'
import { adminText, getAdminReviewStatusLabel, getAdminReviewStatusTone } from '~/utils/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '评论管理',
})

const {
  items,
  total,
  loading,
  error,
  busyId,
  selectedIds,
  keyword,
  status,
  page,
  totalPages,
  pendingCount,
  loadComments,
  reviewComment,
  runBulkAction,
  toggleAllSelection,
  toggleSelection,
  setStatusFilter,
  setKeyword,
  setPage,
} = useAdminComments()

const expandedCommentIds = ref<string[]>([])
const reviewCommentItem = ref<AdminCommentItem | null>(null)
const reviewContentExpanded = ref(false)
const categoryDetailOpen = ref(false)

const allVisibleSelected = computed(() =>
  items.value.length > 0 && items.value.every(item => selectedIds.value.includes(item.id)),
)

const selectedCount = computed(() => selectedIds.value.length)

watch([page, keyword, status], () => {
  loadComments()
}, { immediate: true })

watch(items, (newItems) => {
  if (reviewCommentItem.value && !newItems.some(item => item.id === reviewCommentItem.value?.id)) {
    reviewCommentItem.value = null
    categoryDetailOpen.value = false
  }
})

function handleStatusChange(newStatus: 'all' | 'pending' | 'approved' | 'rejected') {
  setStatusFilter(newStatus)
}

function handleKeywordChange(value: string) {
  setKeyword(value)
}

function isExpanded(commentId: string) {
  return expandedCommentIds.value.includes(commentId)
}

function toggleExpanded(commentId: string) {
  expandedCommentIds.value = isExpanded(commentId)
    ? expandedCommentIds.value.filter(id => id !== commentId)
    : [...expandedCommentIds.value, commentId]
}

function shouldFold(content: string) {
  return content.length > 120 || content.split(/\r?\n/).length > 4
}

function openReview(comment: AdminCommentItem) {
  reviewCommentItem.value = comment
  reviewContentExpanded.value = false
  categoryDetailOpen.value = false
}

function closeReview() {
  reviewCommentItem.value = null
  categoryDetailOpen.value = false
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRiskTone(level: AdminCommentItem['moderationRiskLevel']) {
  if (level === 'high') return 'bg-rose-100 text-rose-700 ring-1 ring-rose-200'
  if (level === 'medium') return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'
  if (level === 'low') return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200'
  return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'
}

function getRiskLabel(level: AdminCommentItem['moderationRiskLevel']) {
  if (level === 'high') return '高风险'
  if (level === 'medium') return '中风险'
  if (level === 'low') return '低风险'
  return '未评级'
}

function getRiskPercent(comment: AdminCommentItem | null) {
  if (!comment) return 0
  if (typeof comment.moderationAiWeightedScore === 'number') {
    return Math.round(Math.min(Math.max(comment.moderationAiWeightedScore, 0), 1) * 100)
  }
  if (typeof comment.moderationRiskScore === 'number') {
    return Math.round(Math.min(Math.max(comment.moderationRiskScore, 0), 100))
  }
  return 0
}

function getRiskBarClass(percent: number) {
  if (percent >= 70) return 'bg-rose-500'
  if (percent >= 40) return 'bg-amber-500'
  return 'bg-emerald-500'
}

function getCategoryLabel(category: AiCategoryDetail) {
  const labels: Record<string, string> = {
    harassment: '骚扰',
    'harassment/threatening': '威胁性骚扰',
    hate: '仇恨',
    'hate/threatening': '威胁性仇恨',
    violence: '暴力',
    'violence/graphic': '血腥暴力',
    sexual: '色情',
    'sexual/minors': '未成年人色情',
    self_harm: '自残',
    'self-harm/intent': '自残意图',
    'self-harm/instructions': '自残指导',
    illicit: '非法内容',
    spam: '垃圾信息',
  }

  return category.label || labels[category.category] || labels[category.category.toLowerCase()] || category.category
}

async function handleApprove(comment: AdminCommentItem | null) {
  if (!comment) return
  const updated = await reviewComment(comment.id, 'approved')
  if (updated && reviewCommentItem.value?.id === comment.id) {
    reviewCommentItem.value = updated
  }
}

async function handleReject(comment: AdminCommentItem | null) {
  if (!comment) return
  const updated = await reviewComment(comment.id, 'rejected', '内容不符合发布规则')
  if (updated && reviewCommentItem.value?.id === comment.id) {
    reviewCommentItem.value = updated
  }
}

</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader title="评论管理" description="集中审核评论内容、访客信息与 AI 风险信号，支持单条处理和批量操作。" />

    <section class="admin-card p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <AdminSearchField
          v-model="keyword"
          placeholder="搜索昵称、邮箱、评论内容或文章标题"
          @update:model-value="handleKeywordChange"
        />

        <div class="flex flex-wrap gap-2">
          <button class="admin-tab-button" :class="{ 'admin-tab-active': status === 'all' }" type="button" @click="handleStatusChange('all')">
            全部
          </button>
          <button class="admin-tab-button" :class="{ 'admin-tab-active': status === 'pending' }" type="button" @click="handleStatusChange('pending')">
            {{ adminText.reviewPending }}
          </button>
          <button class="admin-tab-button" :class="{ 'admin-tab-active': status === 'approved' }" type="button" @click="handleStatusChange('approved')">
            {{ adminText.reviewApproved }}
          </button>
          <button class="admin-tab-button" :class="{ 'admin-tab-active': status === 'rejected' }" type="button" @click="handleStatusChange('rejected')">
            {{ adminText.reviewRejected }}
          </button>
        </div>
      </div>
    </section>

    <div v-if="error" class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ error }}
    </div>

    <section class="admin-card overflow-hidden">
      <div class="flex flex-col gap-4 border-b border-[var(--admin-border)] bg-white/80 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-5">
        <div>
          <p class="text-sm font-semibold text-slate-900">
            当前页 {{ items.length }} 条评论
          </p>
          <p class="mt-1 text-xs text-slate-500">
            本页待审核 {{ pendingCount }} 条，已选择 {{ selectedCount }} 条
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <button class="admin-button-secondary min-h-11" :disabled="loading || items.length === 0" type="button" @click="toggleAllSelection(allVisibleSelected)">
            {{ allVisibleSelected ? '取消本页全选' : '本页全选' }}
          </button>
          <button class="admin-button-primary min-h-11" :disabled="loading || selectedCount === 0 || busyId === 'bulk'" type="button" @click="runBulkAction('approved')">
            <Icon name="lucide:check" class="h-4 w-4" />
            批量通过
          </button>
          <button class="admin-button-secondary min-h-11" :disabled="loading || selectedCount === 0 || busyId === 'bulk'" type="button" @click="runBulkAction('rejected')">
            <Icon name="lucide:x" class="h-4 w-4" />
            批量驳回
          </button>
          <button class="admin-button-danger min-h-11" :disabled="loading || selectedCount === 0 || busyId === 'bulk'" type="button" @click="runBulkAction('delete')">
            <Icon name="lucide:trash-2" class="h-4 w-4" />
            批量删除
          </button>
        </div>
      </div>

      <div v-if="loading" class="px-5 py-12 text-sm text-slate-400">
        正在加载评论...
      </div>

      <div v-else-if="items.length === 0" class="px-5 py-12 text-sm text-slate-400">
        暂无符合筛选条件的评论。
      </div>

      <div v-else class="divide-y divide-slate-100">
        <article
          v-for="comment in items"
          :key="comment.id"
          class="grid gap-4 px-4 py-5 transition hover:bg-slate-50/70 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:px-5"
        >
          <div class="flex items-start gap-3">
            <input
              class="admin-checkbox mt-1"
              :checked="selectedIds.includes(comment.id)"
              type="checkbox"
              :aria-label="`选择 ${comment.nickname} 的评论`"
              @change="toggleSelection(comment.id, ($event.target as HTMLInputElement).checked)"
            >
          </div>

          <div class="min-w-0 space-y-3">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">
                {{ comment.nickname }}
              </p>
              <AdminStatusBadge :tone="getAdminReviewStatusTone(comment.status)">
                {{ getAdminReviewStatusLabel(comment.status) }}
              </AdminStatusBadge>
              <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="getRiskTone(comment.moderationRiskLevel)">
                {{ getRiskLabel(comment.moderationRiskLevel) }}
              </span>
              <span class="text-xs text-slate-400">{{ formatDateTime(comment.createdAt) }}</span>
            </div>

            <div>
              <p class="whitespace-pre-wrap text-sm leading-7 text-slate-700" :class="{ 'line-clamp-4': shouldFold(comment.content) && !isExpanded(comment.id) }">
                {{ comment.content }}
              </p>
              <button
                v-if="shouldFold(comment.content)"
                class="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                type="button"
                @click="toggleExpanded(comment.id)"
              >
                {{ isExpanded(comment.id) ? '收起全文' : '展开全文' }}
              </button>
            </div>

            <div class="grid gap-2 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
              <p class="truncate">
                <span class="font-medium text-slate-600">邮箱：</span>{{ comment.email || '未填写' }}
              </p>
              <p class="truncate">
                <span class="font-medium text-slate-600">真实 IP：</span>{{ comment.ip || 'unknown' }}
              </p>
              <p class="truncate">
                <span class="font-medium text-slate-600">来源：</span>{{ comment.article.title }}
              </p>
              <p class="truncate" :title="comment.userAgent || 'unknown'">
                <span class="font-medium text-slate-600">UA：</span>{{ comment.userAgent || 'unknown' }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch lg:justify-center">
            <button class="admin-button-secondary min-h-11" type="button" @click="openReview(comment)">
              <Icon name="lucide:scan-search" class="h-4 w-4" />
              审核
            </button>
            <button class="admin-button-danger min-h-11" :disabled="busyId === comment.id || busyId === 'bulk'" type="button" @click="handleReject(comment)">
              <Icon name="lucide:x" class="h-4 w-4" />
              驳回
            </button>
            <button class="admin-button-primary min-h-11" :disabled="busyId === comment.id || busyId === 'bulk'" type="button" @click="handleApprove(comment)">
              <Icon name="lucide:check" class="h-4 w-4" />
              通过
            </button>
          </div>
        </article>
      </div>

      <AdminPagination
        label="条评论"
        :page="Math.min(page, totalPages)"
        :total="total"
        :total-pages="totalPages"
        @update:page="setPage"
      />
    </section>

    <Teleport to="body">
      <div v-if="reviewCommentItem" class="admin-modal-overlay admin-modal-overlay-sheet px-0 sm:px-4" role="dialog" aria-modal="true" aria-labelledby="comment-review-title">
        <div class="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl">
          <header class="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div class="min-w-0">
              <p id="comment-review-title" class="text-lg font-bold text-slate-950">
                审核评论
              </p>
              <p class="mt-1 truncate text-sm text-slate-500">
                {{ reviewCommentItem.nickname }} · {{ reviewCommentItem.article.title }}
              </p>
            </div>
            <button class="admin-button-secondary h-10 w-10 flex-none p-0" type="button" aria-label="关闭弹窗" @click="closeReview">
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </header>

          <div class="flex-1 overflow-y-auto px-5 py-5">
            <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-semibold text-slate-900">
                  评论内容
                </p>
                <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold" :class="getRiskTone(reviewCommentItem.moderationRiskLevel)">
                  {{ getRiskLabel(reviewCommentItem.moderationRiskLevel) }}
                </span>
              </div>
              <p class="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700" :class="{ 'line-clamp-5': shouldFold(reviewCommentItem.content) && !reviewContentExpanded }">
                {{ reviewCommentItem.content }}
              </p>
              <button
                v-if="shouldFold(reviewCommentItem.content)"
                class="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                type="button"
                @click="reviewContentExpanded = !reviewContentExpanded"
              >
                {{ reviewContentExpanded ? '收起全文' : '展开全文' }}
              </button>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase text-slate-400">邮箱</p>
                <p class="mt-1 break-words text-sm text-slate-800">{{ reviewCommentItem.email || '未填写' }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase text-slate-400">真实 IP</p>
                <p class="mt-1 break-words text-sm text-slate-800">{{ reviewCommentItem.ip || 'unknown' }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase text-slate-400">创建时间</p>
                <p class="mt-1 text-sm text-slate-800">{{ formatDateTime(reviewCommentItem.createdAt) }}</p>
              </div>
              <div class="rounded-lg border border-slate-200 bg-white p-4">
                <p class="text-xs font-semibold uppercase text-slate-400">来源页面</p>
                <NuxtLink class="mt-1 block truncate text-sm font-semibold text-blue-600 hover:text-blue-700" :to="`/articles/${reviewCommentItem.article.slug}`" target="_blank">
                  {{ reviewCommentItem.article.title }}
                </NuxtLink>
              </div>
            </div>

            <div class="mt-4 rounded-lg border border-slate-200 bg-white p-4">
              <p class="text-xs font-semibold uppercase text-slate-400">User-Agent</p>
              <p class="mt-2 break-words text-sm leading-6 text-slate-700">{{ reviewCommentItem.userAgent || 'unknown' }}</p>
              <CommentMeta
                class="mt-3"
                :browser-label="reviewCommentItem.browserLabel"
                :os-label="reviewCommentItem.osLabel"
                :user-agent="reviewCommentItem.userAgent"
                :country-name="reviewCommentItem.countryName"
                compact
              />
            </div>

            <div class="mt-4 rounded-lg border border-blue-100 bg-blue-50/70 p-4">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-slate-900">AI 风险指数</p>
                  <p v-if="reviewCommentItem.moderationSummary" class="mt-1 text-xs leading-5 text-slate-500">
                    {{ reviewCommentItem.moderationSummary }}
                  </p>
                </div>
                <p class="text-2xl font-bold text-slate-950">
                  {{ getRiskPercent(reviewCommentItem) }}%
                </p>
              </div>
              <div class="mt-4 h-3 overflow-hidden rounded-full bg-white ring-1 ring-blue-100">
                <div class="h-full rounded-full transition-all" :class="getRiskBarClass(getRiskPercent(reviewCommentItem))" :style="{ width: `${getRiskPercent(reviewCommentItem)}%` }" />
              </div>
              <button
                class="admin-button-secondary mt-4 w-full min-h-11"
                type="button"
                :disabled="!reviewCommentItem.moderationAiCategories?.length"
                @click="categoryDetailOpen = true"
              >
                <Icon name="lucide:list-tree" class="h-4 w-4" />
                查看分类详情
              </button>
            </div>
          </div>

          <footer class="grid gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:grid-cols-3">
            <button class="admin-button-primary min-h-11" :disabled="busyId === reviewCommentItem.id || busyId === 'bulk'" type="button" @click="handleApprove(reviewCommentItem)">
              <Icon name="lucide:check" class="h-4 w-4" />
              通过
            </button>
            <button class="admin-button-danger min-h-11" :disabled="busyId === reviewCommentItem.id || busyId === 'bulk'" type="button" @click="handleReject(reviewCommentItem)">
              <Icon name="lucide:x" class="h-4 w-4" />
              驳回
            </button>
            <button class="admin-button-secondary min-h-11" type="button" @click="closeReview">
              关闭弹窗
            </button>
          </footer>
        </div>
      </div>

      <div v-if="categoryDetailOpen && reviewCommentItem" class="admin-modal-overlay admin-modal-overlay-center px-4" role="dialog" aria-modal="true" aria-labelledby="category-detail-title">
        <div class="flex max-h-[82vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <p id="category-detail-title" class="text-lg font-bold text-slate-950">
              AI 分类详情
            </p>
            <button class="admin-button-secondary h-10 w-10 p-0" type="button" aria-label="关闭分类详情" @click="categoryDetailOpen = false">
              <Icon name="lucide:x" class="h-4 w-4" />
            </button>
          </header>

          <div class="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            <div
              v-for="category in reviewCommentItem.moderationAiCategories || []"
              :key="category.category"
              class="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold text-slate-900">
                    {{ getCategoryLabel(category) }}
                  </p>
                  <p class="mt-1 text-xs text-slate-500">
                    {{ category.category }} · 权重 {{ category.weight.toFixed(1) }}x
                  </p>
                </div>
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="category.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'">
                  {{ category.flagged ? '触发' : '正常' }}
                </span>
              </div>
              <div class="mt-3 flex items-center gap-3">
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div class="h-full rounded-full" :class="getRiskBarClass(Math.round(category.weightedScore * 100))" :style="{ width: `${Math.min(category.weightedScore * 100, 100)}%` }" />
                </div>
                <span class="w-14 text-right text-xs font-mono text-slate-600">{{ (category.score * 100).toFixed(1) }}%</span>
              </div>
            </div>

            <p v-if="!reviewCommentItem.moderationAiCategories?.length" class="py-8 text-center text-sm text-slate-400">
              暂无 AI 分类详情。
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
