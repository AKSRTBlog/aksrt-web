import type { AdminCommentItem, PaginatedResponse } from '~/types/admin'

const PAGE_SIZE = 8

type CommentStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

interface LoadCommentsOptions {
  page: number
  keyword: string
  status: CommentStatusFilter
}

export function useAdminComments() {
  const { adminApiFetch } = useAdminSession()

  // 状态
  const items = ref<AdminCommentItem[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref('')
  const busyId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])

  // 筛选条件
  const keyword = ref('')
  const status = ref<CommentStatusFilter>('all')
  const page = ref(1)

  // 计算属性
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
  const pendingCount = computed(() => items.value.filter(item => item.status === 'pending').length)

  // 构建查询 URL
  function buildCommentsPath(input: LoadCommentsOptions) {
    const params = new URLSearchParams({
      page: String(input.page),
      pageSize: String(PAGE_SIZE),
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })

    if (input.keyword.trim()) {
      params.set('keyword', input.keyword.trim())
    }

    if (input.status !== 'all') {
      params.set('status', input.status)
    }

    return `/api/v1/admin/comments?${params.toString()}`
  }

  // 加载评论列表
  async function loadComments() {
    loading.value = true
    error.value = ''

    try {
      const result = await adminApiFetch<PaginatedResponse<AdminCommentItem>>(
        buildCommentsPath({ page: page.value, keyword: keyword.value, status: status.value }),
      )

      items.value = result.list
      total.value = result.total
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '加载评论失败'
    }
    finally {
      loading.value = false
    }
  }

  // 刷新评论
  async function reloadComments() {
    await loadComments()
  }

  // 更新单条评论
  function syncItem(updated: AdminCommentItem) {
    const idx = items.value.findIndex(item => item.id === updated.id)
    if (idx !== -1) {
      items.value[idx] = updated
    }
  }

  // 移除评论
  function removeItem(commentId: string) {
    items.value = items.value.filter(item => item.id !== commentId)
    total.value = Math.max(0, total.value - 1)
    selectedIds.value = selectedIds.value.filter(id => id !== commentId)
  }

  // 审核评论
  async function reviewComment(
    commentId: string,
    nextStatus: 'pending' | 'approved' | 'rejected',
    rejectReason?: string | null,
  ) {
    busyId.value = commentId
    error.value = ''

    try {
      const result = await adminApiFetch<AdminCommentItem>(
        `/api/v1/admin/comments/${commentId}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status: nextStatus,
            rejectReason: rejectReason ?? null,
          }),
        },
      )

      syncItem(result)
      await reloadComments()
      return result
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '审核评论失败'
      return null
    }
    finally {
      busyId.value = null
    }
  }

  // 删除评论
  async function deleteComment(comment: AdminCommentItem) {
    if (!confirm('确认删除这条评论吗？删除后无法恢复。')) {
      return false
    }

    busyId.value = comment.id
    error.value = ''

    try {
      await adminApiFetch(`/api/v1/admin/comments/${comment.id}`, {
        method: 'DELETE',
      })

      removeItem(comment.id)
      await reloadComments()
      return true
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '删除评论失败'
      return false
    }
    finally {
      busyId.value = null
    }
  }

  // 批量操作
  async function runBulkAction(
    action: 'approved' | 'rejected' | 'delete',
    targetIds?: string[],
  ) {
    const targets = targetIds ?? selectedIds.value

    if (targets.length === 0) {
      return
    }

    if (action === 'delete') {
      if (!confirm(`确认删除选中的 ${targets.length} 条评论吗？`)) {
        return
      }
    }

    error.value = ''
    busyId.value = 'bulk'

    try {
      if (action === 'delete') {
        for (const id of targets) {
          await adminApiFetch(`/api/v1/admin/comments/${id}`, { method: 'DELETE' })
          removeItem(id)
        }
        selectedIds.value = []
        await reloadComments()
        return
      }

      const results = await Promise.all(
        targets.map(id =>
          adminApiFetch<AdminCommentItem>(`/api/v1/admin/comments/${id}/review`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: action,
              rejectReason: action === 'rejected' ? '批量驳回' : null,
            }),
          }),
        ),
      )

      results.forEach(syncItem)
      await reloadComments()
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '批量操作失败'
    }
    finally {
      busyId.value = null
    }
  }

  // 全选切换
  function toggleAllSelection(allSelected: boolean) {
    if (allSelected) {
      selectedIds.value = selectedIds.value.filter(
        id => !items.value.some(item => item.id === id),
      )
    }
    else {
      selectedIds.value = Array.from(
        new Set([...selectedIds.value, ...items.value.map(item => item.id)]),
      )
    }
  }

  // 单选切换
  function toggleSelection(id: string, checked: boolean) {
    if (checked) {
      selectedIds.value = Array.from(new Set([...selectedIds.value, id]))
    }
    else {
      selectedIds.value = selectedIds.value.filter(i => i !== id)
    }
  }

  // 状态筛选变化
  function setStatusFilter(newStatus: CommentStatusFilter) {
    status.value = newStatus
    page.value = 1
  }

  // 搜索变化
  function setKeyword(newKeyword: string) {
    keyword.value = newKeyword
    page.value = 1
  }

  // 页码变化
  function setPage(newPage: number) {
    page.value = newPage
  }

  // 重置筛选
  function resetFilters() {
    keyword.value = ''
    status.value = 'all'
    page.value = 1
  }

  return {
    // 状态
    items,
    total,
    loading,
    error,
    busyId,
    selectedIds,
    keyword,
    status,
    page,

    // 计算属性
    totalPages,
    pendingCount,

    // 方法
    loadComments,
    reloadComments,
    reviewComment,
    deleteComment,
    runBulkAction,
    toggleAllSelection,
    toggleSelection,
    setStatusFilter,
    setKeyword,
    setPage,
    resetFilters,
  }
}
