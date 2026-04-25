<script setup lang="ts">
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
  deleteComment,
  runBulkAction,
  toggleAllSelection,
  toggleSelection,
  setStatusFilter,
  setKeyword,
  setPage,
} = useAdminComments()

// 选中的评论详情
const selectedId = ref<string | null>(null)
const selectedComment = computed(() =>
  items.value.find(item => item.id === selectedId.value) ?? items.value[0] ?? null,
)

// 全选状态
const allVisibleSelected = computed(() =>
  items.value.length > 0 && items.value.every(item => selectedIds.value.includes(item.id)),
)

// 加载数据
watch([page, keyword, status], () => {
  loadComments()
}, { immediate: true })

// 选中第一条
watch(items, (newItems) => {
  if (newItems.length > 0 && !selectedId.value) {
    selectedId.value = newItems[0].id
  }
})

function handleStatusChange(newStatus: 'all' | 'pending' | 'approved' | 'rejected') {
  setStatusFilter(newStatus)
}

function handleKeywordChange(value: string) {
  setKeyword(value)
}

function getRiskTone(level: 'low' | 'medium' | 'high' | null) {
  if (level === 'high') {
    return 'bg-rose-100 text-rose-700'
  }
  if (level === 'medium') {
    return 'bg-amber-100 text-amber-700'
  }
  if (level === 'low') {
    return 'bg-emerald-100 text-emerald-700'
  }
  return 'bg-slate-100 text-slate-600'
}

function getRiskLabel(level: 'low' | 'medium' | 'high' | null) {
  if (level === 'high') {
    return '高风险'
  }
  if (level === 'medium') {
    return '中风险'
  }
  if (level === 'low') {
    return '低风险'
  }
  return '未评级'
}

function formatModerationSignal(raw: string | null) {
  if (!raw) {
    return 'No signal payload.'
  }

  try {
    const parsed = JSON.parse(raw)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return raw
  }
}

// AI Confidence Color Helpers
function getConfidenceColor(score: number | null) {
  if (!score || score <= 0.25) return 'text-emerald-600'
  if (score <= 0.50) return 'text-blue-600'
  if (score <= 0.70) return 'text-amber-600'
  return 'text-rose-600'
}

function getConfidenceBarColor(score: number | null) {
  if (!score || score <= 0.25) return 'bg-emerald-500'
  if (score <= 0.50) return 'bg-blue-500'
  if (score <= 0.70) return 'bg-amber-500'
  return 'bg-rose-500'
}

// Category Visual Helpers
function getCategoryIconClass(score: number | undefined) {
  if (!score || score < 0.30) return 'bg-emerald-100 text-emerald-700'
  if (score < 0.60) return 'bg-blue-100 text-blue-700'
  if (score < 0.80) return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

function getCategoryEmoji(category: string | undefined): string {
  if (!category) return '?'

  const catMap: Record<string, string> = {
    sexual_violence: '\u{1F6AB}',
    child_sexual_abuse: '\u{1F4BD}',
    self_harm: '\u{1F64F}',
    harassment: '\u{1F4E2}',
    'harassment/threatening': '\u26A0\uFE0F',
    hate: '\u{1F534}',
    'hate/threatening': '\u{1F525}',
    violence: '\u{1F52B}',
    'violence/graphic': '\uD83D\uDCA5',
    sexual: '\u{1F51E}',
    'sexual/minors': '\u{1F6A8}',
    spam: '\u{1F4E6}',
    fairness: '\u2696\uFE0F',
    medical: '\u2695\uFE0F',
  }

  // Try exact match first
  if (catMap[category]) return catMap[category]

  // Try partial match
  const key = Object.keys(catMap).find(k => category.toLowerCase().includes(k))
  return key ? catMap[key] : '\U0001F50D'
}

async function handleApprove(comment: typeof selectedComment.value) {
  if (comment) {
    await reviewComment(comment.id, 'approved')
    selectedId.value = comment.id
  }
}

async function handleReject(comment: typeof selectedComment.value) {
  if (comment) {
    await reviewComment(comment.id, 'rejected', '内容不符合发布规则')
    selectedId.value = comment.id
  }
}

async function handleReset(comment: typeof selectedComment.value) {
  if (comment) {
    await reviewComment(comment.id, 'pending')
    selectedId.value = comment.id
  }
}

async function handleDelete(comment: typeof selectedComment.value) {
  if (comment) {
    const success = await deleteComment(comment)
    if (success && selectedId.value === comment.id) {
      selectedId.value = items.value[0]?.id ?? null
    }
  }
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader title="评论管理" description="按状态筛选评论，并支持单条或批量审核。" />

    <!-- 搜索和筛选 -->
    <div class="admin-card p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <AdminSearchField v-model="keyword" placeholder="搜索昵称、内容或文章标题" @update:model-value="handleKeywordChange" />

        <div class="flex flex-wrap gap-2">
          <button
            class="admin-button-secondary"
            :class="{ 'admin-button-primary': status === 'all' }"
            @click="handleStatusChange('all')"
          >
            全部
          </button>
          <button
            class="admin-button-secondary"
            :class="{ 'admin-button-primary': status === 'pending' }"
            @click="handleStatusChange('pending')"
          >
            {{ adminText.reviewPending }}
          </button>
          <button
            class="admin-button-secondary"
            :class="{ 'admin-button-primary': status === 'approved' }"
            @click="handleStatusChange('approved')"
          >
            {{ adminText.reviewApproved }}
          </button>
          <button
            class="admin-button-secondary"
            :class="{ 'admin-button-primary': status === 'rejected' }"
            @click="handleStatusChange('rejected')"
          >
            {{ adminText.reviewRejected }}
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ error }}
    </div>

    <!-- 评论列表和详情 -->
    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <!-- 列表 -->
      <div class="admin-card overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">当前页 {{ items.length }} 条</p>
            <p class="text-xs text-slate-500">{{ pendingCount }} 条{{ adminText.reviewPending }}</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="admin-button-secondary"
              :disabled="loading || items.length === 0"
              @click="toggleAllSelection(allVisibleSelected)"
            >
              {{ allVisibleSelected ? '取消本页全选' : '本页全选' }}
            </button>
            <button
              class="admin-button-primary"
              :disabled="loading || selectedIds.length === 0 || busyId === 'bulk'"
              @click="runBulkAction('approved')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              批量通过
            </button>
            <button
              class="admin-button-secondary"
              :disabled="loading || selectedIds.length === 0 || busyId === 'bulk'"
              @click="runBulkAction('rejected')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              批量驳回
            </button>
            <button
              class="admin-button-danger"
              :disabled="loading || selectedIds.length === 0 || busyId === 'bulk'"
              @click="runBulkAction('delete')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              批量删除
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left">
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">选择</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">评论</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">状态</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">时间</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td class="px-5 py-10 text-sm text-slate-400" colspan="5">
                  正在加载评论...
                </td>
              </tr>
              <tr v-else-if="items.length === 0">
                <td class="px-5 py-10 text-sm text-slate-400" colspan="5">
                  暂无符合筛选条件的评论。
                </td>
              </tr>
              <tr
                v-for="comment in items"
                v-else
                :key="comment.id"
                class="border-b border-[var(--admin-border)] transition hover:bg-slate-50"
                :class="{ 'bg-blue-50/50': selectedComment?.id === comment.id }"
              >
                <td class="px-5 py-4">
                  <input
                    :checked="selectedIds.includes(comment.id)"
                    type="checkbox"
                    @change="toggleSelection(comment.id, ($event.target as HTMLInputElement).checked)"
                  >
                </td>
                <td class="px-5 py-4">
                  <button class="block text-left" type="button" @click="selectedId = comment.id">
                    <p class="text-sm font-semibold text-slate-900">{{ comment.nickname }}</p>
                    <p class="mt-1 line-clamp-2 text-sm leading-7 text-slate-500">{{ comment.content }}</p>
                    <div class="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                        :class="getRiskTone(comment.moderationRiskLevel)"
                      >
                        {{ getRiskLabel(comment.moderationRiskLevel) }}
                      </span>
                      <span v-if="comment.moderationRiskScore !== null" class="text-xs text-slate-500">
                        score {{ comment.moderationRiskScore }}
                      </span>
                    </div>
                    <p class="mt-2 text-xs text-slate-400">{{ comment.article.title }}</p>
                  </button>
                </td>
                <td class="px-5 py-4">
                  <AdminStatusBadge :tone="getAdminReviewStatusTone(comment.status)">
                    {{ getAdminReviewStatusLabel(comment.status) }}
                  </AdminStatusBadge>
                </td>
                <td class="px-5 py-4 text-sm text-slate-500">
                  {{ new Date(comment.createdAt).toLocaleDateString('zh-CN') }}
                </td>
                <td class="px-5 py-4">
                  <button class="admin-button-secondary" type="button" @click="selectedId = comment.id">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    查看
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <AdminPagination
          label="评论分页"
          :page="Math.min(page, totalPages)"
          :total="total"
          :total-pages="totalPages"
          @update:page="setPage"
        />
      </div>

      <!-- 详情 -->
      <div class="admin-card p-6">
        <template v-if="selectedComment">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-lg font-semibold text-slate-900">{{ selectedComment.nickname }}</p>
              <p class="mt-1 text-sm text-slate-500">来自 {{ selectedComment.article.title }}</p>
            </div>
            <AdminStatusBadge :tone="getAdminReviewStatusTone(selectedComment.status)">
              {{ getAdminReviewStatusLabel(selectedComment.status) }}
            </AdminStatusBadge>
          </div>

          <div class="mt-6 rounded-[4px] bg-slate-50 p-5">
            <p class="text-sm leading-8 text-slate-700">{{ selectedComment.content }}</p>
          </div>

          <div class="mt-6 space-y-3 text-sm text-slate-500">
            <p>创建时间: {{ new Date(selectedComment.createdAt).toLocaleString('zh-CN') }}</p>
            <p>邮箱: {{ selectedComment.email }}</p>
            <p>网站: {{ selectedComment.website || '未填写' }}</p>
            <div>
              <p class="mb-2">Location:</p>
              <CommentMeta
                :browser-label="selectedComment.browserLabel"
                :os-label="selectedComment.osLabel"
                :user-agent="selectedComment.userAgent"
                :country-name="selectedComment.countryName"
                compact
              />
            </div>
            <p class="break-words">User-Agent: {{ selectedComment.userAgent || 'unknown' }}</p>

            <!-- Enhanced Risk Level Display with Visual Indicator -->
            <div v-if="selectedComment.moderationRiskLevel" class="mt-4">
              <p class="text-sm font-medium text-slate-700 mb-2">风险等级评估</p>
              <div class="flex items-center gap-3">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold"
                  :class="getRiskTone(selectedComment.moderationRiskLevel)"
                >
                  {{ getRiskLabel(selectedComment.moderationRiskLevel) }}
                </span>
                <span class="text-slate-600">
                  综合得分: <strong>{{ selectedComment.moderationRiskScore ?? 0 }}/100</strong>
                </span>
              </div>

              <!-- Confidence Bar -->
              <div v-if="selectedComment.moderationAiWeightedScore !== null && selectedComment.moderationAiWeightedScore > 0" class="mt-3">
                <div class="flex justify-between items-center mb-1">
                  <span class="text-xs text-slate-500">AI 加权风险指数</span>
                  <span class="text-xs font-mono font-semibold" :class="getConfidenceColor(selectedComment.moderationAiWeightedScore)">
                    {{ (selectedComment.moderationAiWeightedScore * 100).toFixed(1) }}%
                  </span>
                </div>
                <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-300 ease-out rounded-full"
                    :class="getConfidenceBarColor(selectedComment.moderationAiWeightedScore)"
                    :style="{ width: Math.min(selectedComment.moderationAiWeightedScore * 100, 100) + '%' }"
                  />
                </div>
                <p class="mt-1 text-xs text-slate-400">
                  越高表示AI检测到越多的违规信号
                </p>
              </div>
            </div>

            <p v-if="selectedComment.moderationSummary" class="break-words mt-3">
              审核摘要:
              <span class="font-normal">{{ selectedComment.moderationSummary }}</span>
            </p>
            <p v-if="selectedComment.moderationPipelineVersion">
              审核管道版本: {{ selectedComment.moderationPipelineVersion }}
            </p>
            <p>回复层级: {{ selectedComment.parent ? `回复 ${selectedComment.parent.nickname}` : '一级评论' }}</p>
            <p v-if="selectedComment.rejectReason">驳回原因: {{ selectedComment.rejectReason }}</p>
          </div>

          <!-- Enhanced AI Category Visualization -->
          <div v-if="selectedComment.moderationAiCategories?.length" class="mt-6 rounded-[4px] border border-[var(--admin-border)] bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-5">
            <h4 class="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI 智能分类详情
            </h4>

            <div class="space-y-3">
              <div
                v-for="(cat, index) in selectedComment.moderationAiCategories"
                :key="cat.category || index"
                class="flex items-center justify-between p-3 rounded-lg bg-white/80 border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <!-- Category Icon/Indicator -->
                  <span
                    class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="getCategoryIconClass(cat.score)"
                  >
                    {{ getCategoryEmoji(cat.category) }}
                  </span>

                  <!-- Category Info -->
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-slate-800 truncate">
                      {{ cat.label || cat.category }}
                    </p>
                    <p class="text-xs text-slate-500 truncate">
                      原始分值: {{ (cat.score * 100).toFixed(1) }}% | 权重: {{ cat.weight.toFixed(1) }}x
                    </p>
                  </div>
                </div>

                <!-- Score Badge & Progress -->
                <div class="flex-shrink-0 ml-4 w-32">
                  <div class="flex items-center justify-between mb-1">
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                      :class="cat.flagged ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'"
                    >
                      {{ cat.flagged ? '触发' : '正常' }}
                    </span>
                    <span class="text-[10px] font-mono text-slate-600">
                      {{ (cat.weightedScore * 100).toFixed(1) }}%
                    </span>
                  </div>
                  <div class="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="cat.flagged ? 'bg-rose-500' : 'bg-emerald-500'"
                      :style="{ width: Math.min(cat.weightedScore * 100, 100) + '%' }"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- AI Analysis Summary -->
            <div class="mt-4 pt-4 border-t border-slate-200/60">
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="rounded-lg bg-white/60 p-2.5">
                  <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">检测类别</p>
                  <p class="text-lg font-bold text-slate-800">{{ selectedComment.moderationAiCategories.length }}</p>
                </div>
                <div class="rounded-lg bg-white/60 p-2.5">
                  <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">触发类别</p>
                  <p class="text-lg font-bold" :class="selectedComment.moderationAiCategories.some(c => c.flagged) ? 'text-rose-600' : 'text-emerald-600'">
                    {{ selectedComment.moderationAiCategories.filter(c => c.flagged).length }}
                  </p>
                </div>
                <div class="rounded-lg bg-white/60 p-2.5">
                  <p class="text-[10px] uppercase tracking-wider text-slate-500 mb-1">最高风险</p>
                  <p class="text-lg font-bold text-slate-800">
                    {{ (Math.max(...selectedComment.moderationAiCategories.map(c => c.score)) * 100).toFixed(0) }}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 space-y-3">
            <p class="text-sm font-semibold text-slate-900">审核命中详情（原始信号）</p>

            <details class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50/70">
              <summary class="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700">
                Akismet 原始信号
              </summary>
              <pre class="overflow-x-auto border-t border-[var(--admin-border)] bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ formatModerationSignal(selectedComment.moderationAkismetRaw) }}</pre>
            </details>

            <details class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50/70">
              <summary class="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700">
                AI 审核原始信号
              </summary>
              <pre class="overflow-x-auto border-t border-[var(--admin-border)] bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ formatModerationSignal(selectedComment.moderationAiRaw) }}</pre>
            </details>
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              class="admin-button-primary"
              :disabled="busyId === selectedComment.id || busyId === 'bulk'"
              @click="handleApprove(selectedComment)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              通过
            </button>
            <button
              class="admin-button-secondary"
              :disabled="busyId === selectedComment.id || busyId === 'bulk'"
              @click="handleReset(selectedComment)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              设为{{ adminText.reviewPending }}
            </button>
            <button
              class="admin-button-danger"
              :disabled="busyId === selectedComment.id || busyId === 'bulk'"
              @click="handleReject(selectedComment)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              驳回
            </button>
            <button
              class="admin-button-secondary"
              :disabled="busyId === selectedComment.id || busyId === 'bulk'"
              @click="handleDelete(selectedComment)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
          </div>

          <NuxtLink
            class="mt-6 inline-flex text-sm font-medium text-blue-600 hover:underline"
            :to="`/articles/${selectedComment.article.slug}`"
            target="_blank"
          >
            打开文章
          </NuxtLink>
        </template>

        <div v-else class="flex h-full min-h-64 items-center justify-center text-sm text-slate-400">
          请选择一条评论查看详情
        </div>
      </div>
    </section>
  </div>
</template>
