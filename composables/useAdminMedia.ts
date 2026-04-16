import type { MediaAssetItem, MediaUsage, PaginatedResponse, UpdateMediaAssetInput } from '~/types/admin'
import type { MediaSortField, MediaSortOrder, MediaStatusFilter } from '~/utils/admin-media'
import { formatMediaSize, uploadAdminMediaFile } from '~/utils/admin-media'

export function useAdminMedia() {
  const { adminApiFetch } = useAdminSession()

  const items = ref<MediaAssetItem[]>([])
  const loading = ref(false)
  const uploading = ref(false)
  const error = ref('')
  const successMessage = ref('')

  const keyword = ref('')
  const usage = ref<MediaUsage | ''>('')
  const status = ref<MediaStatusFilter>('active')
  const sortBy = ref<MediaSortField>('createdAt')
  const sortOrder = ref<MediaSortOrder>('desc')
  const page = ref(1)
  const pageSize = 30
  const total = ref(0)

  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
  const hasFilters = computed(() =>
    Boolean(keyword.value.trim())
    || Boolean(usage.value)
    || status.value !== 'active'
    || sortBy.value !== 'createdAt'
    || sortOrder.value !== 'desc',
  )

  let messageTimer: ReturnType<typeof setTimeout> | null = null

  function clearMessageTimer() {
    if (messageTimer) {
      clearTimeout(messageTimer)
      messageTimer = null
    }
  }

  function showMessage(message: string, isError = false) {
    clearMessageTimer()

    if (isError) {
      error.value = message
      successMessage.value = ''
    }
    else {
      successMessage.value = message
      error.value = ''
    }

    if (!message) {
      return
    }

    messageTimer = setTimeout(() => {
      error.value = ''
      successMessage.value = ''
      messageTimer = null
    }, 3200)
  }

  async function loadItems() {
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams({
        page: String(page.value),
        pageSize: String(pageSize),
        sortBy: sortBy.value,
        sortOrder: sortOrder.value,
      })

      if (keyword.value.trim()) {
        params.set('keyword', keyword.value.trim())
      }

      if (usage.value) {
        params.set('usage', usage.value)
      }

      if (status.value) {
        params.set('status', status.value)
      }

      const result = await adminApiFetch<PaginatedResponse<MediaAssetItem>>(`/api/v1/admin/media?${params.toString()}`)
      items.value = result.list
      total.value = result.total

      if (page.value > 1 && items.value.length === 0 && total.value > 0) {
        page.value = Math.min(page.value - 1, Math.max(1, Math.ceil(total.value / pageSize)))
        return loadItems()
      }
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '加载媒体资源失败', true)
    }
    finally {
      loading.value = false
    }
  }

  async function uploadFiles(files: Iterable<File> | FileList, usageValue: MediaUsage = 'misc') {
    const queue = Array.from(files).filter(file => file instanceof File)
    if (queue.length === 0) {
      return []
    }

    uploading.value = true
    error.value = ''

    const uploaded: MediaAssetItem[] = []
    let failed = 0
    let lastErrorMessage = ''

    try {
      for (const file of queue) {
        try {
          const result = await uploadAdminMediaFile(adminApiFetch, file, usageValue)
          uploaded.push(result)
        }
        catch (e) {
          failed += 1
          lastErrorMessage = e instanceof Error ? e.message : '上传失败'
        }
      }

      page.value = 1
      await loadItems()

      if (uploaded.length > 0) {
        if (failed > 0) {
          showMessage(`已上传 ${uploaded.length} 个文件，另有 ${failed} 个失败`)
        }
        else if (uploaded.length === 1) {
          showMessage('文件上传成功')
        }
        else {
          showMessage(`已上传 ${uploaded.length} 个文件`)
        }
      }
      else {
        showMessage(lastErrorMessage || '上传失败', true)
      }

      return uploaded
    }
    finally {
      uploading.value = false
    }
  }

  async function deleteFile(asset: MediaAssetItem, options?: { skipConfirm?: boolean }) {
    if (!options?.skipConfirm && !confirm(`确定要删除 “${asset.originalFilename || asset.filename}” 吗？`)) {
      return false
    }

    error.value = ''

    try {
      await adminApiFetch(`/api/v1/admin/media/${asset.id}`, {
        method: 'DELETE',
      })

      const nextTotal = Math.max(0, total.value - 1)
      const shouldGoPreviousPage = items.value.length === 1 && page.value > 1

      items.value = items.value.filter(item => item.id !== asset.id)
      total.value = nextTotal

      if (shouldGoPreviousPage) {
        page.value -= 1
        await loadItems()
      }

      showMessage('文件已删除')
      return true
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '删除失败', true)
      return false
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      showMessage('链接已复制到剪贴板')
      return true
    }
    catch {
      showMessage('复制失败，请手动复制链接', true)
      return false
    }
  }

  async function saveMetadata(assetId: string, input: UpdateMediaAssetInput) {
    error.value = ''

    try {
      const result = await adminApiFetch<MediaAssetItem>(`/api/v1/admin/media/${assetId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })

      items.value = items.value.map(item => (item.id === result.id ? result : item))
      showMessage('附件详情已更新')
      return result
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '保存附件详情失败', true)
      return null
    }
  }

  function resetFilters() {
    keyword.value = ''
    usage.value = ''
    status.value = 'active'
    sortBy.value = 'createdAt'
    sortOrder.value = 'desc'
    page.value = 1
  }

  return {
    items,
    loading,
    uploading,
    error,
    successMessage,
    keyword,
    usage,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
    total,
    totalPages,
    hasFilters,
    loadItems,
    uploadFiles,
    deleteFile,
    copyUrl,
    saveMetadata,
    resetFilters,
    formatSize: formatMediaSize,
  }
}
