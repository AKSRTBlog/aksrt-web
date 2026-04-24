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
            <p v-if="selectedComment.moderationRiskLevel">
              风险等级: {{ selectedComment.moderationRiskLevel }} ({{ selectedComment.moderationRiskScore ?? 0 }})
            </p>
            <p v-if="selectedComment.moderationSummary" class="break-words">
              审核摘要: {{ selectedComment.moderationSummary }}
            </p>
            <p v-if="selectedComment.moderationPipelineVersion">
              审核管道版本: {{ selectedComment.moderationPipelineVersion }}
            </p>
            <p>回复层级: {{ selectedComment.parent ? `回复 ${selectedComment.parent.nickname}` : '一级评论' }}</p>
            <p v-if="selectedComment.rejectReason">驳回原因: {{ selectedComment.rejectReason }}</p>
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
