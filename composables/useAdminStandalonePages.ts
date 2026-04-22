import type { StandalonePageItem } from '~/types/admin'
import {
  sanitizeArticleSlug,
  insertTextAtSelection,
  buildMarkdownTable,
  buildExcerptFromMarkdown,
} from '~/utils/admin-editor'

export interface UpdateStandalonePageInput {
  id?: string
  title: string
  slug: string
  summary: string
  content: string
  sortOrder: number
  enabled: boolean
}

export function useAdminStandalonePages() {
  const { adminApiFetch } = useAdminSession()
  const { invalidatePublicData } = usePublicDataInvalidation()

  // 状态
  const items = ref<StandalonePageItem[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const successMessage = ref('')
  const activeId = ref<string | null>(null)

  // 计算属性
  const activePage = computed(() =>
    items.value.find(item => item.id === activeId.value) ?? items.value[0] ?? null,
  )

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

  // 创建空白页面
  function makePage(): StandalonePageItem {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `page-${Date.now()}`,
      title: '',
      slug: '',
      summary: '',
      content: '',
      sortOrder: 0,
      enabled: true,
      updatedAt: new Date().toISOString(),
    }
  }

  // 加载所有页面
  async function loadPages() {
    loading.value = true
    error.value = ''

    try {
      const result = await adminApiFetch<StandalonePageItem[]>('/api/v1/admin/site-settings/standalone-pages')
      const nextItems = result.length > 0 ? result : [makePage()]
      items.value = nextItems
      activeId.value = activeId.value ?? nextItems[0]?.id ?? null
      showMessage('')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '加载独立页失败', true)
    }
    finally {
      loading.value = false
    }
  }

  // 保存所有页面
  async function savePages() {
    // 检查必填字段
    const validItems = items.value.filter(
      item => item.title.trim() && item.slug.trim() && item.content.trim(),
    )

    if (validItems.length === 0) {
      showMessage('Please complete at least one standalone page (title, slug, and content).', true)
      return
    }

    saving.value = true

    try {
      const payload: UpdateStandalonePageInput[] = validItems.map((item, index) => {
        const normalizedContent = item.content.trim()
        const normalizedSummary = item.summary.trim()
        const resolvedSummary = normalizedSummary || buildExcerptFromMarkdown(normalizedContent, 150)

        return {
          id: item.id,
          title: item.title.trim(),
          slug: sanitizeArticleSlug(item.slug.trim()),
          summary: resolvedSummary,
          content: normalizedContent,
          sortOrder: index,
          enabled: item.enabled,
        }
      })

      const result = await adminApiFetch<StandalonePageItem[]>('/api/v1/admin/site-settings/standalone-pages', {
        method: 'PUT',
        body: JSON.stringify({ items: payload }),
      })

      const nextItems = result.length > 0 ? result : [makePage()]
      items.value = nextItems
      activeId.value = nextItems.find(item => item.id === activeId.value)?.id ?? nextItems[0]?.id ?? null
      invalidatePublicData()
      showMessage('独立页已保存')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '保存失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 更新页面
  function updateItem(id: string, updater: (item: StandalonePageItem) => StandalonePageItem) {
    items.value = items.value.map(item => (item.id === id ? updater(item) : item))
  }

  // 移动页面
  function moveItem(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.value.length)
      return

    const next = [...items.value]
    ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
    items.value = next
  }

  // 添加页面
  function addPage() {
    const next = makePage()
    items.value = [...items.value, next]
    activeId.value = next.id
  }

  // 删除页面
  function removePage(id: string) {
    let next = items.value.filter(item => item.id !== id)

    if (next.length === 0) {
      const fallback = makePage()
      activeId.value = fallback.id
      items.value = [fallback]
      return
    }

    if (activeId.value === id) {
      activeId.value = next[0].id
    }

    items.value = next
  }

  // 选中页面
  function selectPage(id: string) {
    activeId.value = id
  }

  return {
    // 状态
    items,
    loading,
    saving,
    error,
    successMessage,
    activeId,
    activePage,

    // 工具函数
    makePage,
    sanitizeArticleSlug,
    insertTextAtSelection,
    buildMarkdownTable,

    // 方法
    loadPages,
    savePages,
    updateItem,
    moveItem,
    addPage,
    removePage,
    selectPage,
  }
}
