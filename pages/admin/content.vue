<script setup lang="ts">
import { adminText } from '~/utils/admin'
import { resolveNavigationIconClass, resolveNavigationIconName } from '~/utils/navigation-icons'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '内容管理',
})

const {
  loading,
  saving,
  error,
  successMessage,
  navigationItems,
  categories,
  tags,
  makeNavItem,
  makeCategory,
  makeTag,
  slugify,
  loadAll,
  saveNavigation,
  moveNavItem,
  addCategory,
  updateCategory,
  deleteCategory,
  addTag,
  updateTag,
  deleteTag,
} = useAdminContent()

// 标签页状态
type Tab = 'navigation' | 'categories' | 'tags'
const activeTab = ref<Tab>('navigation')

const fontAwesomeIconOptions = [
  'fa-solid fa-house',
  'fa-solid fa-newspaper',
  'fa-solid fa-stopwatch-20',
  'fa-regular fa-file-lines',
  'fa-regular fa-heart',
  'fa-brands fa-github',
]

// 快速添加表单
const newCategory = ref({
  name: '',
  slug: '',
  description: '',
  isEnabled: true,
})

const newTag = ref({
  name: '',
  slug: '',
})

// 编辑状态
const editingCategoryId = ref<string | null>(null)
const editingTagId = ref<string | null>(null)

// 加载数据
onMounted(async () => {
  await loadAll()
})

// 快速添加分类
async function handleAddCategory() {
  await addCategory({
    name: newCategory.value.name.trim(),
    slug: newCategory.value.slug.trim(),
    description: newCategory.value.description.trim(),
    isEnabled: newCategory.value.isEnabled,
  })
  newCategory.value = makeCategory()
}

// 快速添加标签
async function handleAddTag() {
  await addTag({
    name: newTag.value.name.trim(),
    slug: newTag.value.slug.trim(),
  })
  newTag.value = makeTag()
}

// 处理分类名称变化，自动生成 slug
function handleCategoryNameChange() {
  newCategory.value.slug = slugify(newCategory.value.name)
}

// 处理标签名称变化，自动生成 slug
function handleTagNameChange() {
  newTag.value.slug = slugify(newTag.value.name)
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader title="内容管理" description="管理顶部菜单、分类和标签">
      <template #actions>
        <button class="admin-button-secondary" :disabled="loading" @click="loadAll">
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': loading }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
      </template>
    </AdminPageHeader>

    <!-- 错误/成功提示 -->
    <div v-if="error" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </div>
    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <datalist id="font-awesome-navigation-icons">
      <option v-for="iconName in fontAwesomeIconOptions" :key="iconName" :value="iconName" />
    </datalist>

    <!-- 加载状态 -->
    <div v-if="loading" class="admin-card p-6 text-center text-sm text-slate-500">
      加载中...
    </div>

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
        <!-- 侧边栏标签 -->
        <aside class="admin-card p-3">
          <div class="space-y-1">
            <button
              class="flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"
              :class="activeTab === 'navigation' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              @click="activeTab = 'navigation'"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <span class="font-medium">菜单设置</span>
            </button>

            <button
              class="flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"
              :class="activeTab === 'categories' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              @click="activeTab = 'categories'"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="font-medium">分类设置</span>
            </button>

            <button
              class="flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"
              :class="activeTab === 'tags' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'"
              @click="activeTab = 'tags'"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="font-medium">标签设置</span>
            </button>
          </div>
        </aside>

        <!-- 主内容区 -->
        <div class="space-y-6">
          <!-- 菜单设置 -->
          <div v-if="activeTab === 'navigation'" class="admin-card overflow-hidden p-0">
            <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
              <div>
                <h3 class="text-base font-semibold text-slate-900">菜单项列表</h3>
                <p class="text-sm text-slate-500">拖动排序，编辑顶部导航栏显示的菜单项</p>
              </div>
              <div class="flex gap-3">
                <button
                  class="admin-button-secondary"
                  type="button"
                  @click="navigationItems.push(makeNavItem())"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  添加菜单项
                </button>
                <button
                  class="admin-button-primary"
                  type="button"
                  :disabled="saving"
                  @click="saveNavigation"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  保存菜单
                </button>
              </div>
            </div>

            <div v-if="navigationItems.length === 0" class="px-5 py-12 text-center text-sm text-slate-500">
              暂无菜单项，点击上方按钮添加
            </div>

            <div v-else class="divide-y divide-[var(--admin-border)]">
              <div
                v-for="(item, index) in navigationItems"
                :key="item.id ?? index"
                class="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50"
              >
                <!-- 排序控制 -->
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    :disabled="index === 0"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    title="上移"
                    @click="moveNavItem(index, 'up')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    :disabled="index === navigationItems.length - 1"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    title="下移"
                    @click="moveNavItem(index, 'down')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <!-- 序号 -->
                <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                  {{ index + 1 }}
                </div>

                <!-- 表单字段 -->
                <div class="grid flex-1 gap-3 md:grid-cols-[1fr_1.3fr_1fr_auto]">
                  <input
                    v-model="item.label"
                    class="admin-input"
                    placeholder="菜单名称"
                  >
                  <input
                    v-model="item.href"
                    class="admin-input"
                    placeholder="链接地址（如：/articles）"
                  >
                  <div class="relative">
                    <input
                      v-model="item.iconUrl"
                      class="admin-input pr-10"
                      list="font-awesome-navigation-icons"
                      placeholder="FA 图标，如 fa-solid fa-stopwatch-20"
                    >
                    <span
                      v-if="resolveNavigationIconName(item.iconUrl)"
                      class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    >
                      <Icon :name="resolveNavigationIconName(item.iconUrl)" class="h-4 w-4" />
                    </span>
                    <span
                      v-else-if="resolveNavigationIconClass(item.iconUrl)"
                      class="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 text-slate-500"
                      aria-hidden="true"
                    >
                      <i :class="resolveNavigationIconClass(item.iconUrl)" class="h-4 w-4 text-center leading-4" />
                    </span>
                  </div>
                  <div class="flex items-center gap-3">
                    <!-- 启用开关 -->
                    <button
                      type="button"
                      class="admin-switch"
                      :class="{ 'admin-switch-on': item.enabled }"
                      :title="item.enabled ? '点击禁用' : '点击启用'"
                      @click="item.enabled = !item.enabled"
                    >
                      <span class="admin-switch-thumb" />
                    </button>
                    <!-- 删除按钮 -->
                    <button
                      type="button"
                      class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="删除"
                      @click="navigationItems.splice(index, 1)"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分类设置 -->
          <div v-if="activeTab === 'categories'" class="space-y-6">
            <!-- 快速添加区域 -->
            <div class="admin-card p-5">
              <div class="mb-4">
                <h3 class="text-base font-semibold text-slate-900">快速添加分类</h3>
                <p class="text-sm text-slate-500">填写以下信息创建新分类</p>
              </div>
              <div class="grid gap-4 md:grid-cols-[1fr_1fr_2fr_auto]">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-700">分类名称 *</label>
                  <input
                    v-model="newCategory.name"
                    class="admin-input"
                    placeholder="如：技术博客"
                    @input="handleCategoryNameChange"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-700">别名 (Slug) *</label>
                  <input
                    v-model="newCategory.slug"
                    class="admin-input"
                    placeholder="如：techblog 或 tech-blog"
                  >
                  <p class="mt-1 text-xs text-slate-500">只能包含小写字母、数字，连字符可选</p>
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-700">描述 *</label>
                  <input
                    v-model="newCategory.description"
                    class="admin-input"
                    placeholder="分类简介说明"
                  >
                </div>
                <div class="flex items-end gap-3">
                  <label class="flex items-center gap-2 pb-1">
                    <button
                      type="button"
                      class="admin-switch"
                      :class="{ 'admin-switch-on': newCategory.isEnabled }"
                      @click="newCategory.isEnabled = !newCategory.isEnabled"
                    >
                      <span class="admin-switch-thumb" />
                    </button>
                    <span class="text-xs font-medium text-slate-700">启用</span>
                  </label>
                  <button
                    class="admin-button-primary"
                    type="button"
                    :disabled="saving"
                    @click="handleAddCategory"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    添加分类
                  </button>
                </div>
              </div>
            </div>

            <!-- 分类列表 -->
            <div class="admin-card overflow-hidden p-0">
              <div class="border-b border-[var(--admin-border)] px-5 py-4">
                <h3 class="text-base font-semibold text-slate-900">已有分类</h3>
                <p class="text-sm text-slate-500">共 {{ categories.length }} 个分类</p>
              </div>

              <div v-if="categories.length === 0" class="px-5 py-12 text-center text-sm text-slate-500">
                暂无分类，请在上方添加
              </div>

              <div v-else class="divide-y divide-[var(--admin-border)]">
                <div
                  v-for="item in categories"
                  :key="item.id"
                  class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50"
                >
                  <!-- 编辑模式 -->
                  <template v-if="editingCategoryId === item.id">
                    <div class="grid flex-1 gap-3 md:grid-cols-[1fr_1fr_2fr]">
                      <input
                        v-model="item.name"
                        class="admin-input"
                        placeholder="分类名称"
                      >
                      <input
                        v-model="item.slug"
                        class="admin-input"
                        placeholder="别名"
                      >
                      <input
                        v-model="item.description"
                        class="admin-input"
                        placeholder="描述"
                      >
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- 启用开关 -->
                      <button
                        type="button"
                        class="admin-switch"
                        :class="{ 'admin-switch-on': item.isEnabled }"
                        @click="item.isEnabled = !item.isEnabled"
                      >
                        <span class="admin-switch-thumb" />
                      </button>
                      <!-- 保存按钮 -->
                      <button
                        class="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                        type="button"
                        title="保存"
                        @click="updateCategory(item.id, { name: item.name, slug: item.slug, description: item.description, isEnabled: item.isEnabled }); editingCategoryId = null"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </button>
                      <!-- 取消按钮 -->
                      <button
                        class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        type="button"
                        title="取消"
                        @click="editingCategoryId = null"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </template>

                  <!-- 展示模式 -->
                  <template v-else>
                    <div class="flex-1">
                      <div class="flex items-center gap-3">
                        <h4 class="font-medium text-slate-900">{{ item.name }}</h4>
                        <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {{ item.slug }}
                        </span>
                        <span
                          v-if="item.isEnabled"
                          class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                        >
                          {{ adminText.statusEnabled }}
                        </span>
                        <span
                          v-else
                          class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"
                        >
                          {{ adminText.statusDisabled }}
                        </span>
                      </div>
                      <p class="mt-1 text-sm text-slate-500">{{ item.description }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <!-- 编辑按钮 -->
                      <button
                        class="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                        type="button"
                        title="编辑"
                        @click="editingCategoryId = item.id"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <!-- 删除按钮 -->
                      <button
                        class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        type="button"
                        title="删除"
                        @click="deleteCategory(item.id)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 标签设置 -->
          <div v-if="activeTab === 'tags'" class="space-y-6">
            <!-- 快速添加区域 -->
            <div class="admin-card p-5">
              <div class="mb-4">
                <h3 class="text-base font-semibold text-slate-900">快速添加标签</h3>
                <p class="text-sm text-slate-500">填写以下信息创建新标签</p>
              </div>
              <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-700">标签名称 *</label>
                  <input
                    v-model="newTag.name"
                    class="admin-input"
                    placeholder="如：React"
                    @input="handleTagNameChange"
                  >
                </div>
                <div>
                  <label class="mb-1.5 block text-xs font-medium text-slate-700">别名 (Slug) *</label>
                  <input
                    v-model="newTag.slug"
                    class="admin-input"
                    placeholder="如：react 或 react-hook"
                  >
                  <p class="mt-1 text-xs text-slate-500">只能包含小写字母、数字，连字符可选</p>
                </div>
                <div class="flex items-end">
                  <button
                    class="admin-button-primary"
                    type="button"
                    :disabled="saving"
                    @click="handleAddTag"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    添加标签
                  </button>
                </div>
              </div>
            </div>

            <!-- 标签列表 -->
            <div class="admin-card overflow-hidden p-0">
              <div class="border-b border-[var(--admin-border)] px-5 py-4">
                <h3 class="text-base font-semibold text-slate-900">已有标签</h3>
                <p class="text-sm text-slate-500">共 {{ tags.length }} 个标签</p>
              </div>

              <div v-if="tags.length === 0" class="px-5 py-12 text-center text-sm text-slate-500">
                暂无标签，请在上方添加
              </div>

              <div v-else class="flex flex-wrap gap-2 p-5">
                <div
                  v-for="item in tags"
                  :key="item.id"
                  class="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-blue-300"
                >
                  <!-- 编辑模式 -->
                  <template v-if="editingTagId === item.id">
                    <input
                      v-model="item.name"
                      class="min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1 text-sm"
                      placeholder="名称"
                    >
                    <input
                      v-model="item.slug"
                      class="min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1 text-sm"
                      placeholder="别名"
                    >
                    <button
                      class="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                      type="button"
                      title="保存"
                      @click="updateTag(item.id, { name: item.name, slug: item.slug }); editingTagId = null"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                    </button>
                    <button
                      class="rounded p-1 text-slate-400 hover:bg-slate-200"
                      type="button"
                      title="取消"
                      @click="editingTagId = null"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </template>

                  <!-- 展示模式 -->
                  <template v-else>
                    <span class="text-sm font-medium text-slate-700">#{{ item.name }}</span>
                    <button
                      class="rounded p-0.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-blue-600 group-hover:opacity-100"
                      type="button"
                      title="编辑"
                      @click="editingTagId = item.id"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      class="rounded p-0.5 text-slate-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
                      type="button"
                      title="删除"
                      @click="deleteTag(item.id)"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
