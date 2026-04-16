import type { MediaAssetItem, MediaUsage, PaginatedResponse } from '~/types/admin'
import { uploadAdminMediaFile } from '~/utils/admin-media'

export function useMediaPicker() {
  const { adminApiFetch } = useAdminSession()

  const loading = ref(false)
  const uploading = ref(false)
  const error = ref('')
  const items = ref<MediaAssetItem[]>([])
  const total = ref(0)
  const keyword = ref('')
  const page = ref(1)
  const pageSize = 24

  async function loadMedia() {
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams({
        page: String(page.value),
        pageSize: String(pageSize),
        status: 'active',
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      if (keyword.value.trim()) {
        params.set('keyword', keyword.value.trim())
      }

      const result = await adminApiFetch<PaginatedResponse<MediaAssetItem>>(
        `/api/v1/admin/media?${params.toString()}`,
      )

      items.value = result.list
      total.value = result.total

      if (page.value > 1 && items.value.length === 0 && total.value > 0) {
        page.value -= 1
        return loadMedia()
      }
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '加载媒体库失败'
    }
    finally {
      loading.value = false
    }
  }

  async function uploadFiles(files: Iterable<File> | FileList, usage: MediaUsage = 'article_content') {
    const queue = Array.from(files).filter(file => file instanceof File)
    if (queue.length === 0) {
      return []
    }

    uploading.value = true
    error.value = ''

    const uploaded: MediaAssetItem[] = []

    try {
      for (const file of queue) {
        const result = await uploadAdminMediaFile(adminApiFetch, file, usage)
        uploaded.push(result)
      }

      page.value = 1
      await loadMedia()
      return uploaded
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '上传失败'
      return uploaded
    }
    finally {
      uploading.value = false
    }
  }

  function resetState() {
    keyword.value = ''
    page.value = 1
    error.value = ''
  }

  return {
    loading,
    uploading,
    error,
    items,
    total,
    keyword,
    page,
    pageSize,
    loadMedia,
    uploadFiles,
    resetState,
  }
}
