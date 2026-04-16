<script setup lang="ts">
interface ProjectItem {
  id: string
  title: string
  description: string
  icon: string | null
  link: string
  sortOrder: number
  enabled: boolean
  createdAt: string
  updatedAt: string
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '项目管理',
})

const { adminApiFetch } = useAdminSession()
const { invalidatePublicData } = usePublicDataInvalidation()

const items = ref<ProjectItem[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const successMessage = ref('')

let successTimer: ReturnType<typeof setTimeout> | null = null

function clearSuccessTimer() {
  if (!successTimer) {
    return
  }

  clearTimeout(successTimer)
  successTimer = null
}

function normalizeProjectItems(source: ProjectItem[]) {
  return source.map((item, index) => ({
    ...item,
    title: item.title.trim(),
    description: item.description.trim(),
    icon: item.icon?.trim() || null,
    link: item.link.trim(),
    sortOrder: index,
  }))
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  }
  catch {
    return false
  }
}

function getValidationMessage(list: ProjectItem[]) {
  const missingRequired = list.findIndex(item => !item.title || !item.description || !item.link)
  if (missingRequired >= 0) {
    return `请先完善项目 #${missingRequired + 1} 的标题、简介和链接。`
  }

  const invalidLink = list.findIndex(item => !isValidUrl(item.link))
  if (invalidLink >= 0) {
    return `项目 #${invalidLink + 1} 的链接不是有效的 http/https 地址。`
  }

  return ''
}

async function loadProjects() {
  loading.value = true
  error.value = ''

  try {
    const result = await adminApiFetch<ProjectItem[]>('/api/v1/admin/projects')
    items.value = normalizeProjectItems(result || [])
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '加载项目失败'
  }
  finally {
    loading.value = false
  }
}

function addProject() {
  const newItem: ProjectItem = {
    id: `temp-${Date.now()}`,
    title: '',
    description: '',
    icon: null,
    link: 'https://github.com/',
    sortOrder: items.value.length,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  items.value = [...items.value, newItem]
}

function removeProject(id: string) {
  items.value = normalizeProjectItems(items.value.filter(item => item.id !== id))
}

function updateProject(id: string, field: keyof ProjectItem, value: string | boolean) {
  items.value = items.value.map(item => (item.id === id ? { ...item, [field]: value } : item))
}

function moveUp(index: number) {
  if (index === 0) {
    return
  }

  const nextItems = [...items.value]
  ;[nextItems[index - 1], nextItems[index]] = [nextItems[index], nextItems[index - 1]]
  items.value = normalizeProjectItems(nextItems)
}

function moveDown(index: number) {
  if (index === items.value.length - 1) {
    return
  }

  const nextItems = [...items.value]
  ;[nextItems[index], nextItems[index + 1]] = [nextItems[index + 1], nextItems[index]]
  items.value = normalizeProjectItems(nextItems)
}

async function saveProjects() {
  saving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const normalizedItems = normalizeProjectItems(items.value)
    const validationMessage = getValidationMessage(normalizedItems)

    items.value = normalizedItems

    if (validationMessage) {
      error.value = validationMessage
      return
    }

    const result = await adminApiFetch<ProjectItem[]>('/api/v1/admin/projects', {
      method: 'PUT',
      body: JSON.stringify({
        items: normalizedItems.map(item => ({
          id: item.id.startsWith('temp-') ? undefined : item.id,
          title: item.title,
          description: item.description,
          icon: item.icon,
          link: item.link,
          sortOrder: item.sortOrder,
          enabled: item.enabled,
        })),
      }),
    })

    items.value = normalizeProjectItems(result || [])
    invalidatePublicData()

    clearSuccessTimer()
    successMessage.value = '项目已保存'
    successTimer = setTimeout(() => {
      successMessage.value = ''
      successTimer = null
    }, 3000)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '保存项目失败'
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProjects()
})

onBeforeUnmount(() => {
  clearSuccessTimer()
})
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="项目管理"
      description="管理展示在关于页面的项目卡片。"
    >
      <template #actions>
        <button class="admin-button-primary" type="button" @click="addProject">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加项目
        </button>
      </template>
    </AdminPageHeader>

    <div v-if="error" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </div>
    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div v-if="loading" class="admin-card p-6 text-center text-sm text-slate-500">
      正在加载项目...
    </div>

    <div v-else class="space-y-4">
      <div v-if="items.length === 0" class="admin-card p-8 text-center text-sm text-slate-500">
        暂无项目，点击上方“添加项目”按钮开始配置。
      </div>

      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="admin-card p-6"
      >
        <div class="mb-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="h-4 w-4 cursor-move text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
            </svg>
            <span class="text-sm font-medium text-slate-700">项目 #{{ index + 1 }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              class="admin-button-secondary text-xs"
              :disabled="index === 0"
              type="button"
              @click="moveUp(index)"
            >
              上移
            </button>
            <button
              class="admin-button-secondary text-xs"
              :disabled="index === items.length - 1"
              type="button"
              @click="moveDown(index)"
            >
              下移
            </button>
            <button
              class="admin-button-danger text-xs"
              type="button"
              @click="removeProject(item.id)"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">标题 *</label>
            <input
              :value="item.title"
              class="admin-input"
              placeholder="项目名称"
              @input="updateProject(item.id, 'title', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">链接 *</label>
            <input
              :value="item.link"
              class="admin-input"
              type="url"
              placeholder="https://github.com/user/repo"
              @input="updateProject(item.id, 'link', ($event.target as HTMLInputElement).value)"
            >
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-medium text-slate-700">图标 URL</label>
            <input
              :value="item.icon ?? ''"
              class="admin-input"
              type="url"
              placeholder="https://example.com/icon.png"
              @input="updateProject(item.id, 'icon', ($event.target as HTMLInputElement).value)"
            >
            <p class="mt-1 text-xs text-slate-500">可选，留空时会显示默认图标。</p>
          </div>

          <div class="flex items-center">
            <label class="admin-checkbox-label">
              <input
                :checked="item.enabled"
                type="checkbox"
                class="admin-checkbox"
                @change="updateProject(item.id, 'enabled', ($event.target as HTMLInputElement).checked)"
              >
              <span>启用此项目</span>
            </label>
          </div>

          <div class="md:col-span-2">
            <label class="mb-1.5 block text-sm font-medium text-slate-700">简介 *</label>
            <textarea
              :value="item.description"
              class="admin-textarea"
              rows="3"
              placeholder="项目简介描述"
              @input="updateProject(item.id, 'description', ($event.target as HTMLTextAreaElement).value)"
            />
          </div>
        </div>

        <div v-if="item.link" class="mt-4 border-t border-[var(--admin-border)] pt-4">
          <a
            :href="item.link"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            预览链接
          </a>
        </div>
      </div>

      <button
        class="admin-button-primary"
        :disabled="saving || items.length === 0"
        type="button"
        @click="saveProjects"
      >
        {{ saving ? '保存中...' : '保存配置' }}
      </button>
    </div>
  </div>
</template>
