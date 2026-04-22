import type {
  AdminFriendLinkApplicationItem,
  FooterLinkItem,
  UpdateFooterLinkInput,
} from '~/types/admin'

export function useAdminFriendLinks() {
  const { adminApiFetch } = useAdminSession()
  const { invalidatePublicData } = usePublicDataInvalidation()

  const items = ref<FooterLinkItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const successMessage = ref('')

  const applications = ref<AdminFriendLinkApplicationItem[]>([])
  const applicationsLoading = ref(false)
  const applicationKeyword = ref('')
  const applicationFilter = ref<'all' | AdminFriendLinkApplicationItem['status']>('all')
  const selectedApplicationId = ref<string | null>(null)
  const reviewNote = ref('')
  const busyApplicationId = ref<string | null>(null)

  const filteredApplications = computed(() => {
    const keyword = applicationKeyword.value.trim().toLowerCase()

    return applications.value.filter((item) => {
      if (applicationFilter.value !== 'all' && item.status !== applicationFilter.value) {
        return false
      }

      if (!keyword) {
        return true
      }

      return [
        item.siteName,
        item.siteUrl,
        item.contactName,
        item.contactEmail,
        item.description,
        item.message ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    })
  })

  const selectedApplication = computed(() =>
    filteredApplications.value.find(item => item.id === selectedApplicationId.value) ?? null,
  )

  const counts = computed(() => ({
    all: applications.value.length,
    pending: applications.value.filter(item => item.status === 'pending').length,
    approved: applications.value.filter(item => item.status === 'approved').length,
    rejected: applications.value.filter(item => item.status === 'rejected').length,
  }))

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

  function makeLinkItem(): FooterLinkItem {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `friend-link-${Date.now()}`,
      label: '',
      href: '',
      iconUrl: null,
      description: '',
      sortOrder: 0,
      enabled: true,
    }
  }

  function normalizeItemsOrder(list: FooterLinkItem[]) {
    return [...list]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((item, index) => ({
        ...item,
        sortOrder: index,
      }))
  }

  async function loadItems() {
    loading.value = true

    try {
      const result = await adminApiFetch<FooterLinkItem[]>('/api/v1/admin/site-settings/footer-links')
      items.value = result.length > 0 ? normalizeItemsOrder(result) : [makeLinkItem()]
      showMessage('')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '加载友链失败', true)
    }
    finally {
      loading.value = false
    }
  }

  async function loadApplications() {
    applicationsLoading.value = true

    try {
      const result = await adminApiFetch<AdminFriendLinkApplicationItem[]>('/api/v1/admin/friend-link-applications')
      applications.value = result

      if (!selectedApplicationId.value || !result.some(item => item.id === selectedApplicationId.value)) {
        selectedApplicationId.value = result[0]?.id ?? null
      }

      showMessage('')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '加载申请失败', true)
    }
    finally {
      applicationsLoading.value = false
    }
  }

  async function saveItems() {
    saving.value = true

    try {
      const payload: UpdateFooterLinkInput[] = items.value
        .filter(item => item.label.trim() && item.href.trim())
        .map((item, index) => ({
          id: item.id,
          label: item.label.trim(),
          href: item.href.trim(),
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
          description: item.description.trim(),
          sortOrder: index,
          enabled: item.enabled,
        }))

      const result = await adminApiFetch<FooterLinkItem[]>('/api/v1/admin/site-settings/footer-links', {
        method: 'PUT',
        body: JSON.stringify({ items: payload }),
      })

      items.value = result.length > 0 ? normalizeItemsOrder(result) : [makeLinkItem()]
      invalidatePublicData()
      showMessage('友情链接已保存')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '保存失败', true)
    }
    finally {
      saving.value = false
    }
  }

  function moveItemTo(sourceIndex: number, targetIndex: number) {
    if (
      sourceIndex < 0
      || targetIndex < 0
      || sourceIndex >= items.value.length
      || targetIndex >= items.value.length
      || sourceIndex === targetIndex
    ) {
      return
    }

    const next = [...items.value]
    const [moved] = next.splice(sourceIndex, 1)
    if (!moved) {
      return
    }

    next.splice(targetIndex, 0, moved)
    items.value = next.map((item, index) => ({
      ...item,
      sortOrder: index,
    }))
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    moveItemTo(index, direction === 'up' ? index - 1 : index + 1)
  }

  function removeItem(index: number) {
    let next = items.value.filter((_, i) => i !== index)
    if (next.length === 0) {
      next = [makeLinkItem()]
    }
    items.value = next.map((item, idx) => ({
      ...item,
      sortOrder: idx,
    }))
  }

  async function handleReview(status: AdminFriendLinkApplicationItem['status']) {
    if (!selectedApplication.value) {
      return
    }

    busyApplicationId.value = selectedApplication.value.id

    try {
      const result = await adminApiFetch<AdminFriendLinkApplicationItem>(
        `/api/v1/admin/friend-link-applications/${selectedApplication.value.id}/review`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            reviewNote: reviewNote.value.trim() ? reviewNote.value.trim() : null,
          }),
        },
      )

      applications.value = applications.value.map(item =>
        item.id === result.id ? result : item,
      )

      selectedApplicationId.value = result.id
      reviewNote.value = result.reviewNote ?? ''

      await loadItems()
      invalidatePublicData()

      showMessage(
        status === 'approved'
          ? '申请已通过并同步到正式友链'
          : status === 'rejected'
            ? '申请已驳回'
            : '申请已设为待审核',
      )
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '审核失败', true)
    }
    finally {
      busyApplicationId.value = null
    }
  }

  async function loadAll() {
    await Promise.all([loadItems(), loadApplications()])
  }

  return {
    items,
    loading,
    saving,
    error,
    successMessage,

    applications,
    applicationsLoading,
    applicationKeyword,
    applicationFilter,
    selectedApplicationId,
    reviewNote,
    busyApplicationId,
    filteredApplications,
    selectedApplication,
    counts,

    makeLinkItem,

    loadItems,
    loadApplications,
    saveItems,
    moveItemTo,
    moveItem,
    removeItem,
    handleReview,
    loadAll,
  }
}
