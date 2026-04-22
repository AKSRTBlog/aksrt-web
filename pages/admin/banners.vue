<script setup lang="ts">
import MediaPickerDialog from '~/components/admin/MediaPickerDialog.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: 'Banner 管理',
})

const {
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
  stats,
  loadItems,
  toggleStatus,
  deleteBanner,
  openCreateDialog,
  openEditDialog,
  closeDialog,
  saveBanner,
  selectImage,
} = useAdminBanners()

const mediaPickerOpen = ref(false)

watch([keyword, status], () => {
  loadItems()
}, { immediate: true })

watch(dialogOpen, (isOpen) => {
  if (!isOpen) {
    mediaPickerOpen.value = false
  }
})

const positionLabels: Record<string, string> = {
  home_top: '首页顶部',
  home_sidebar: '首页侧边栏',
  article_sidebar: '文章侧边栏',
  footer: '页脚',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="Banner 管理"
      description="管理站点各位置的 Banner 图片，支持拖拽排序。"
    >
      <template #actions>
        <button class="admin-button-primary" @click="openCreateDialog">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          新建 Banner
        </button>
      </template>
    </AdminPageHeader>

    <!-- 消息提示 -->
    <div v-if="error" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </div>
    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <!-- 筛选 -->
    <div class="admin-card p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <input
          v-model="keyword"
          class="admin-input max-w-xs"
          placeholder="搜索 Banner..."
        >

        <div class="flex flex-wrap gap-2">
          <button
            :class="status === 'all' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="status = 'all'"
          >
            全部 {{ stats.total }}
          </button>
          <button
            :class="status === 'enabled' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="status = 'enabled'"
          >
            已启用 {{ stats.active }}
          </button>
          <button
            :class="status === 'disabled' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="status = 'disabled'"
          >
            已禁用 {{ stats.disabled }}
          </button>
        </div>
      </div>
    </div>

    <!-- Banner 列表 -->
    <div class="admin-card overflow-hidden">
      <div v-if="loading" class="p-6 text-center text-sm text-slate-500">
        正在加载...
      </div>

      <div v-else-if="items.length === 0" class="p-6 text-center text-sm text-slate-500">
        暂无 Banner，点击上方按钮创建。
      </div>

      <div v-else class="divide-y divide-[var(--admin-border)]">
        <div
          v-for="item in items"
          :key="item.id"
          class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50"
        >
          <!-- 图片 -->
          <div class="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            <img
              :src="item.imageUrl"
              :alt="item.title"
              class="h-full w-full object-cover"
            >
            <div
              v-if="item.showText"
              class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2"
            >
              <p class="truncate text-xs font-medium text-white">{{ item.title }}</p>
            </div>
          </div>

          <!-- 信息 -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-medium text-slate-900">{{ item.title }}</h4>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="item.status === 'enabled' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
              >
                {{ item.status === 'enabled' ? '已启用' : '已禁用' }}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-500">
              位置: {{ positionLabels[item.position] || item.position }}
              <span class="mx-2">|</span>
              {{ item.linkUrl ? '链接: ' + item.linkUrl : '无链接' }}
            </p>
            <p v-if="item.description" class="mt-1 text-sm text-slate-400 truncate">
              {{ item.description }}
            </p>
          </div>

          <!-- 操作 -->
          <div class="flex items-center gap-2">
            <button
              :disabled="busyId === item.id"
              class="admin-button-secondary"
              @click="openEditDialog(item)"
            >
              编辑
            </button>
            <button
              :disabled="busyId === item.id"
              :class="item.status === 'enabled' ? 'admin-button-secondary' : 'admin-button-primary'"
              @click="toggleStatus(item)"
            >
              {{ item.status === 'enabled' ? '禁用' : '启用' }}
            </button>
            <button
              :disabled="busyId === item.id"
              class="admin-button-danger"
              @click="deleteBanner(item)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <Teleport to="body">
      <div
        v-if="dialogOpen"
        class="admin-modal-overlay admin-modal-overlay-center"
      >
        <div class="admin-card w-full max-w-2xl overflow-hidden shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ isEditing ? '编辑 Banner' : '新建 Banner' }}
            </h3>
            <button class="admin-button-secondary px-3 py-2" type="button" @click="closeDialog">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Form -->
          <div class="space-y-4 p-5">
            <!-- 图片 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">Banner 图片 *</label>
              <div class="flex items-start gap-4">
                <div class="relative h-32 w-64 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                  <img
                    v-if="draft.imageUrl"
                    :src="draft.imageUrl"
                    alt="Banner"
                    class="h-full w-full object-cover"
                  >
                  <div v-else class="flex h-full w-full items-center justify-center text-slate-400">
                    暂无图片
                  </div>
                </div>
                <div class="flex-1 space-y-2">
                  <input
                    v-model="draft.imageUrl"
                    class="admin-input"
                    placeholder="图片 URL 或从媒体库选择"
                  >
                  <button
                    class="admin-button-secondary"
                    type="button"
                    @click="mediaPickerOpen = true"
                  >
                    从媒体库选择
                  </button>
                </div>
              </div>
            </div>

            <!-- 标题 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">标题 *</label>
              <input
                v-model="draft.title"
                class="admin-input"
                placeholder="Banner 标题"
              >
            </div>

            <!-- 描述 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">描述</label>
              <textarea
                v-model="draft.description"
                class="admin-textarea"
                placeholder="Banner 描述（可选）"
              />
            </div>

            <!-- 链接 -->
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-700">链接地址</label>
                <input
                  v-model="draft.linkUrl"
                  class="admin-input"
                  placeholder="https://example.com"
                >
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-700">打开方式</label>
                <select v-model="draft.linkTarget" class="admin-select">
                  <option value="_self">当前窗口</option>
                  <option value="_blank">新窗口</option>
                </select>
              </div>
            </div>

            <!-- 位置 -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-slate-700">显示位置</label>
              <select v-model="draft.position" class="admin-select">
                <option value="home_top">首页顶部</option>
                <option value="home_sidebar">首页侧边栏</option>
                <option value="article_sidebar">文章侧边栏</option>
                <option value="footer">页脚</option>
              </select>
            </div>

            <!-- 显示文字 -->
            <div>
              <label class="admin-checkbox-label">
                <input v-model="draft.showText" type="checkbox" class="admin-checkbox">
                <span>图片上显示标题文字</span>
              </label>
            </div>

            <!-- 状态 -->
            <div>
              <label class="admin-checkbox-label">
                <input
                  :checked="draft.status === 'enabled'"
                  type="checkbox"
                  class="admin-checkbox"
                  @change="draft.status = ($event.target as HTMLInputElement).checked ? 'enabled' : 'disabled'"
                >
                <span>启用此 Banner</span>
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4">
            <button class="admin-button-secondary" type="button" @click="closeDialog">
              取消
            </button>
            <button class="admin-button-primary" :disabled="saving" @click="saveBanner">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <MediaPickerDialog
      :open="dialogOpen && mediaPickerOpen"
      title="选择 Banner 图片"
      empty-message="暂无可选图片，请先上传一张。"
      search-placeholder="搜索媒体库图片"
      upload-usage="banner"
      @close="mediaPickerOpen = false"
      @select="(asset) => { selectImage(asset); mediaPickerOpen = false }"
    />
  </div>
</template>
