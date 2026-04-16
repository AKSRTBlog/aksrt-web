import type {
  AdminCategoryItem,
  AdminTagItem,
  CreateCategoryInput,
  CreateTagInput,
  NavigationItem,
  UpdateCategoryInput,
  UpdateNavigationItemInput,
  UpdateTagInput,
} from '~/types/admin'

export function useAdminContent() {
  const { adminApiFetch } = useAdminSession()
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const successMessage = ref('')

  // 状态数据
  const navigationItems = ref<NavigationItem[]>([])
  const categories = ref<AdminCategoryItem[]>([])
  const tags = ref<AdminTagItem[]>([])

  // 反馈提示
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

  // 加载所有数据
  async function loadAll() {
    loading.value = true
    error.value = ''

    try {
      const [nav, cats, ts] = await Promise.all([
        adminApiFetch<NavigationItem[]>('/api/v1/admin/site-settings/navigation'),
        adminApiFetch<AdminCategoryItem[]>('/api/v1/admin/articles/meta/categories'),
        adminApiFetch<AdminTagItem[]>('/api/v1/admin/articles/meta/tags'),
      ])

      navigationItems.value = nav.length > 0 ? nav : [makeNavItem()]
      categories.value = cats
      tags.value = ts
      showMessage('')
    }
    catch (e) {
      error.value = e instanceof Error ? e.message : '加载数据失败'
    }
    finally {
      loading.value = false
    }
  }

  // 创建空白菜单项
  function makeNavItem(): NavigationItem {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `nav-${Date.now()}`,
      label: '',
      href: '',
      sortOrder: 0,
      enabled: true,
    }
  }

  // 创建空白分类
  function makeCategory(): AdminCategoryItem {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `cat-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      isEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // 创建空白标签
  function makeTag(): AdminTagItem {
    return {
      id: typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `tag-${Date.now()}`,
      name: '',
      slug: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  // URL slugify
  function slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
      .substring(0, 120)
  }

  // 保存菜单
  async function saveNavigation() {
    saving.value = true
    try {
      const payload: UpdateNavigationItemInput[] = navigationItems.value
        .filter(item => item.label.trim() && item.href.trim())
        .map((item, index) => ({
          id: item.id,
          label: item.label.trim(),
          href: item.href.trim(),
          iconUrl: item.iconUrl ?? null,
          sortOrder: index,
          enabled: item.enabled,
        }))

      const result = await adminApiFetch<NavigationItem[]>('/api/v1/admin/site-settings/navigation', {
        method: 'PUT',
        body: JSON.stringify({ items: payload }),
      })

      navigationItems.value = result
      showMessage('菜单已保存')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '保存菜单失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 移动菜单项
  function moveNavItem(index: number, direction: 'up' | 'down') {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= navigationItems.value.length)
      return

    const items = [...navigationItems.value]
    ;[items[index], items[newIndex]] = [items[newIndex], items[index]]
    navigationItems.value = items
  }

  // 添加分类
  async function addCategory(input: CreateCategoryInput) {
    if (!input.name.trim() || !input.slug.trim() || !input.description.trim()) {
      showMessage('请补全分类名称、别名和描述', true)
      return
    }

    saving.value = true
    try {
      const created = await adminApiFetch<AdminCategoryItem>('/api/v1/admin/articles/meta/categories', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      categories.value = [...categories.value, created].sort((a, b) => a.name.localeCompare(b.name))
      showMessage('分类已创建')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '创建分类失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 更新分类
  async function updateCategory(categoryId: string, input: UpdateCategoryInput) {
    saving.value = true
    try {
      const result = await adminApiFetch<AdminCategoryItem>(
        `/api/v1/admin/articles/meta/categories/${categoryId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      )

      categories.value = categories.value
        .map(row => (row.id === result.id ? result : row))
        .sort((a, b) => a.name.localeCompare(b.name))

      showMessage('分类已更新')
      return result
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '更新分类失败', true)
      return null
    }
    finally {
      saving.value = false
    }
  }

  // 删除分类
  async function deleteCategory(categoryId: string) {
    if (!confirm('确定要删除此分类吗？'))
      return

    saving.value = true
    try {
      await adminApiFetch<void>(`/api/v1/admin/articles/meta/categories/${categoryId}`, {
        method: 'DELETE',
      })

      categories.value = categories.value.filter(item => item.id !== categoryId)
      showMessage('分类已删除')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '删除分类失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 添加标签
  async function addTag(input: CreateTagInput) {
    if (!input.name.trim() || !input.slug.trim()) {
      showMessage('请补全标签名称和别名', true)
      return
    }

    saving.value = true
    try {
      const created = await adminApiFetch<AdminTagItem>('/api/v1/admin/articles/meta/tags', {
        method: 'POST',
        body: JSON.stringify(input),
      })

      tags.value = [...tags.value, created].sort((a, b) => a.name.localeCompare(b.name))
      showMessage('标签已创建')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '创建标签失败', true)
    }
    finally {
      saving.value = false
    }
  }

  // 更新标签
  async function updateTag(tagId: string, input: UpdateTagInput) {
    saving.value = true
    try {
      const result = await adminApiFetch<AdminTagItem>(
        `/api/v1/admin/articles/meta/tags/${tagId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(input),
        },
      )

      tags.value = tags.value
        .map(row => (row.id === result.id ? result : row))
        .sort((a, b) => a.name.localeCompare(b.name))

      showMessage('标签已更新')
      return result
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '更新标签失败', true)
      return null
    }
    finally {
      saving.value = false
    }
  }

  // 删除标签
  async function deleteTag(tagId: string) {
    if (!confirm('确定要删除此标签吗？'))
      return

    saving.value = true
    try {
      await adminApiFetch<void>(`/api/v1/admin/articles/meta/tags/${tagId}`, {
        method: 'DELETE',
      })

      tags.value = tags.value.filter(item => item.id !== tagId)
      showMessage('标签已删除')
    }
    catch (e) {
      showMessage(e instanceof Error ? e.message : '删除标签失败', true)
    }
    finally {
      saving.value = false
    }
  }

  return {
    // 状态
    loading,
    saving,
    error,
    successMessage,
    navigationItems,
    categories,
    tags,

    // 工具函数
    makeNavItem,
    makeCategory,
    makeTag,
    slugify,

    // 方法
    loadAll,
    saveNavigation,
    moveNavItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
  }
}
