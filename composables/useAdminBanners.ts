import type { BannerItem, BannerPosition, BannerStatus, PaginatedResponse } from '~/types/admin'

export interface BannerDraft {
  id?: string
  title: string
  description: string
  imageUrl: string
  linkUrl: string
  linkTarget: '_self' | '_blank'
  position: BannerPosition
  sortOrder: number
  status: BannerStatus
  showText: boolean
}

const emptyBannerDraft: BannerDraft = {
  title: '',
  description: '',
  imageUrl: '',
  linkUrl: '',
  linkTarget: '_self',
  position: 'home_top',
  sortOrder: 0,
  status: 'enabled',
  showText: true,
}

export function useAdminBanners() {
  const { adminApiFetch } = useAdminSession()
  const { invalidatePublicData } = usePublicDataInvalidation()

  // 状态
  const items = ref<BannerItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const successMessage = ref('')
  const busyId = ref<string | null>(null)

  // 筛选
  const keyword = ref('')
  const status = ref<'all' | BannerStatus>('all')

  // 编辑对话框
  const dialogOpen = ref(false)
  const draft = ref<BannerDraft>({ ...emptyBannerDraft })
  const isEditing = computed(() => Boolean(draft.value.id))

  // 计算属性
  const stats = computed(() => ({
    total: items.value.length,
    active: items.value.filter(item => item.status === 'enabled').length,
    disabled: items.value.filter(item => item.status === 'disabled').length,
  }))

  // 反馈
  function showMessage(msg: string, isError = false) {
    if (isError) {
      error.value = msg
      successMessage.value = ''
    }
    else {
      successMessage.value = msg
      error.value = ''
    }

    if (msg) {
      setTimeout(() => {
        error.value = ''
        successMessage.value = ''
      }, 3000)
    }
  }

  // 加载 Banner 列表
  async function loadItems() {
    loading.value = true
    error.value = ''

    try {
      const params = new URLSearchParams({
        pageSize: '100',
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      })

      if (keyword.value.trim()) {
        params.set('keyword', keyword.value.trim())
      }

      if (status.value !== 'all') {
        params.set('status', status.value)
      }

      const result = await adminApiFetch<PaginatedResponse<BannerItem>>(`/api/v1/admin/banners?${params.toString()}`)
      items.value = result.list
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '加载 Banner 失败', true)
    }
    finally {
      loading.value = false
    }
  }

  // 切换状态
  async function toggleStatus(banner: BannerItem) {
    busyId.value = banner.id
    error.value = ''

    try {
      const result = await adminApiFetch<BannerItem>(`/api/v1/admin/banners/${banner.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: banner.status === 'enabled' ? 'disabled' : 'enabled',
        }),
      })

      items.value = items.value.map(item => (item.id === result.id ? result : item))
      invalidatePublicData()
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '更新状态失败', true)
    }
    finally {
      busyId.value = null
    }
  }

  // 删除 Banner
  async function deleteBanner(banner: BannerItem) {
    if (!confirm('确定要删除此 Banner 吗？')) {
      return
    }

    busyId.value = banner.id
    error.value = ''

    try {
      await adminApiFetch(`/api/v1/admin/banners/${banner.id}`, {
        method: 'DELETE',
      })

      items.value = items.value.filter(item => item.id !== banner.id)
      invalidatePublicData()
      showMessage('Banner 已删除')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '删除失败', true)
    }
    finally {
      busyId.value = null
    }
  }

  // 打开新建对话框
  function openCreateDialog() {
    draft.value = {
      ...emptyBannerDraft,
      sortOrder: items.value.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1,
    }
    dialogOpen.value = true
  }

  // 打开编辑对话框
  function openEditDialog(item: BannerItem) {
    draft.value = {
      id: item.id,
      title: item.title,
      description: item.description ?? '',
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      linkTarget: item.linkTarget,
      position: item.position,
      sortOrder: item.sortOrder,
      status: item.status,
      showText: item.showText ?? true,
    }
    dialogOpen.value = true
  }

  // 关闭对话框
  function closeDialog() {
    dialogOpen.value = false
    draft.value = { ...emptyBannerDraft }
  }

  // 保存 Banner
  async function saveBanner() {
    if (!draft.value.title.trim()) {
      showMessage('请填写 Banner 标题', true)
      return
    }

    if (!draft.value.imageUrl.trim()) {
      showMessage('请选择 Banner 图片', true)
      return
    }

    saving.value = true
    error.value = ''

    try {
      const body = {
        title: draft.value.title.trim(),
        description: draft.value.description.trim() || null,
        imageUrl: draft.value.imageUrl.trim(),
        linkUrl: draft.value.linkUrl.trim(),
        linkTarget: draft.value.linkTarget,
        position: draft.value.position,
        sortOrder: draft.value.sortOrder,
        status: draft.value.status,
        showText: draft.value.showText,
      }

      if (isEditing.value) {
        const result = await adminApiFetch<BannerItem>(`/api/v1/admin/banners/${draft.value.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        })

        items.value = items.value.map(item => (item.id === result.id ? result : item))
        invalidatePublicData()
        showMessage('Banner 已更新')
      }
      else {
        const result = await adminApiFetch<BannerItem>('/api/v1/admin/banners', {
          method: 'POST',
          body: JSON.stringify(body),
        })

        items.value = [...items.value, result]
        invalidatePublicData()
        showMessage('Banner 已创建')
      }

      closeDialog()
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '保存失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 选择图片
  function selectImage(asset: { url: string }) {
    draft.value.imageUrl = asset.url
  }

  return {
    // 状态
    items,
    loading,
    saving,
    error,
    successMessage,
    busyId,
    keyword,
    status,
    dialogOpen,
    draft,
    isEditing,

    // 计算属性
    stats,

    // 方法
    loadItems,
    toggleStatus,
    deleteBanner,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    saveBanner,
    selectImage,
  }
}
