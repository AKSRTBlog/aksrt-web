<script setup lang="ts">
import type { FooterLinkItem } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '友情链接',
})

const {
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
  loadAll,
  saveItems,
  moveItemTo,
  moveItem,
  removeItem,
  handleReview,
} = useAdminFriendLinks()

const dragSourceIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

// 加载数据
onMounted(() => {
  loadAll()
})

// 更新友链字段
function updateItem(index: number, updater: (item: FooterLinkItem) => FooterLinkItem) {
  items.value = items.value.map((item, i) => (i === index ? updater(item) : item))
}

function applicationStatusLabel(status: string) {
  return status === 'approved' ? '已通过' : status === 'rejected' ? '已驳回' : '待审核'
}

function applicationStatusTone(status: string) {
  return status === 'approved' ? 'success' : status === 'rejected' ? 'danger' : 'warning'
}

function handleDragStart(index: number, event: DragEvent) {
  dragSourceIndex.value = index
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }
}

function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault()
  dragOverIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(index: number, event: DragEvent) {
  event.preventDefault()
  const sourceIndex = dragSourceIndex.value
  if (sourceIndex === null) {
    return
  }
  moveItemTo(sourceIndex, index)
  dragSourceIndex.value = null
  dragOverIndex.value = null
}

function handleDragEnd() {
  dragSourceIndex.value = null
  dragOverIndex.value = null
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="友情链接"
      description="管理正式友情链接，并审核前台提交的友情链接申请。审核通过后会自动同步到前台友情链接页面和页脚。"
    >
      <template #actions>
        <NuxtLink to="/links" target="_blank" class="admin-button-secondary">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          查看前台
        </NuxtLink>
        <button class="admin-button-secondary" :disabled="loading || applicationsLoading" @click="loadAll">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading || applicationsLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
        <button class="admin-button-primary" :disabled="saving" @click="saveItems">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存正式友链
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

    <!-- 正式友链列表 -->
    <section class="admin-card overflow-hidden p-0">
      <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
        <div>
          <h3 class="text-base font-semibold text-slate-900">正式友链列表</h3>
          <p class="text-sm text-slate-500">这里维护当前对外展示的友情链接。审核通过的申请也会自动同步到这一列表。</p>
        </div>
        <button class="admin-button-secondary" @click="items.push(makeLinkItem())">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          添加友链
        </button>
      </div>

      <div v-if="loading" class="px-5 py-6 text-sm text-slate-500">
        正在加载正式友链...
      </div>

      <div v-else class="divide-y divide-[var(--admin-border)]">
        <div
          v-for="(item, index) in items"
          :key="item.id ?? index"
          draggable="true"
          class="flex gap-4 px-5 py-5 transition hover:bg-slate-50/50"
          :class="{ 'opacity-70': dragSourceIndex === index, 'bg-blue-50/60 ring-1 ring-blue-200': dragOverIndex === index && dragSourceIndex !== index }"
          @dragstart="handleDragStart(index, $event)"
          @dragover="handleDragOver(index, $event)"
          @drop="handleDrop(index, $event)"
          @dragend="handleDragEnd"
        >
          <!-- 排序控制 -->
          <div class="flex flex-col gap-1 pt-1">
            <span class="inline-flex cursor-grab items-center justify-center rounded p-1 text-slate-400" title="拖拽排序">
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
              </svg>
            </span>
            <button
              :disabled="index === 0"
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
              title="上移"
              type="button"
              @click="moveItem(index, 'up')"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              :disabled="index === items.length - 1"
              class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
              title="下移"
              type="button"
              @click="moveItem(index, 'down')"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- 图标 -->
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
            <img v-if="item.iconUrl" :alt="item.label || '图标'" :src="item.iconUrl" class="h-10 w-10 rounded-2xl object-cover">
            <span v-else>{{ index + 1 }}</span>
          </div>

          <!-- 表单 -->
          <div class="grid flex-1 gap-3 md:grid-cols-[1fr_1.3fr]">
            <input
              :value="item.label"
              class="admin-input"
              placeholder="链接名称"
              @input="updateItem(index, (i) => ({ ...i, label: ($event.target as HTMLInputElement).value }))"
            >
            <input
              :value="item.href"
              class="admin-input"
              placeholder="例如 /pages/about 或 https://example.com"
              @input="updateItem(index, (i) => ({ ...i, href: ($event.target as HTMLInputElement).value }))"
            >
            <input
              :value="item.iconUrl ?? ''"
              class="admin-input md:col-span-2"
              placeholder="图标地址，例如 https://example.com/logo.png"
              @input="updateItem(index, (i) => ({ ...i, iconUrl: ($event.target as HTMLInputElement).value }))"
            >
            <textarea
              :value="item.description"
              class="admin-input min-h-24 md:col-span-2"
              placeholder="友情链接简介，将显示在前台友情链接卡片中"
              @input="updateItem(index, (i) => ({ ...i, description: ($event.target as HTMLTextAreaElement).value }))"
            />

            <div class="md:col-span-2 flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <button
                  :class="item.enabled ? 'admin-switch admin-switch-on' : 'admin-switch'"
                  :title="item.enabled ? '点击停用' : '点击启用'"
                  type="button"
                  @click="updateItem(index, (i) => ({ ...i, enabled: !i.enabled }))"
                >
                  <span class="admin-switch-thumb" />
                </button>
                <span class="text-sm text-slate-500">启用后会显示在页脚和友情链接页</span>
              </div>

              <button
                class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="删除"
                type="button"
                @click="removeItem(index)"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 申请筛选 -->
    <div class="admin-card p-4">
      <div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <AdminSearchField
          v-model="applicationKeyword"
          placeholder="搜索站点名称、地址、联系人或邮箱"
        />

        <div class="flex flex-wrap gap-2">
          <button
            :class="applicationFilter === 'all' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="applicationFilter = 'all'"
          >
            全部 {{ counts.all }}
          </button>
          <button
            :class="applicationFilter === 'pending' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="applicationFilter = 'pending'"
          >
            待审核 {{ counts.pending }}
          </button>
          <button
            :class="applicationFilter === 'approved' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="applicationFilter = 'approved'"
          >
            已通过 {{ counts.approved }}
          </button>
          <button
            :class="applicationFilter === 'rejected' ? 'admin-button-primary' : 'admin-button-secondary'"
            @click="applicationFilter = 'rejected'"
          >
            已驳回 {{ counts.rejected }}
          </button>
        </div>
      </div>
    </div>

    <!-- 申请审核 -->
    <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <!-- 申请列表 -->
      <div class="admin-card overflow-hidden">
        <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
          <div>
            <p class="text-sm font-semibold text-slate-900">申请审核队列</p>
            <p class="text-xs text-slate-500">共 {{ filteredApplications.length }} 条符合当前筛选条件</p>
          </div>
          <button class="admin-button-secondary" :disabled="applicationsLoading" @click="loadAll">
            <svg class="h-4 w-4" :class="{ 'animate-spin': applicationsLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新申请
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left">
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">站点</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">状态</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">联系人</th>
                <th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">提交时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="applicationsLoading">
                <td class="px-5 py-10 text-sm text-slate-400" colspan="4">
                  正在加载申请记录...
                </td>
              </tr>
              <tr v-else-if="filteredApplications.length === 0">
                <td class="px-5 py-10 text-sm text-slate-400" colspan="4">
                  当前没有符合筛选条件的友情链接申请。
                </td>
              </tr>
              <tr
                v-for="item in filteredApplications"
                v-else
                :key="item.id"
                class="cursor-pointer border-b border-[var(--admin-border)] transition hover:bg-slate-50"
                :class="{ 'bg-blue-50/50': selectedApplication?.id === item.id }"
                @click="selectedApplicationId = item.id"
              >
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">
                      <img v-if="item.iconUrl" :alt="item.siteName" :src="item.iconUrl" class="h-10 w-10 rounded-2xl object-cover">
                      <span v-else>{{ item.siteName.slice(0, 1).toUpperCase() }}</span>
                    </div>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-slate-900">{{ item.siteName }}</p>
                      <p class="truncate text-sm text-slate-500">{{ item.siteUrl }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <AdminStatusBadge :tone="applicationStatusTone(item.status) as any">
                    {{ applicationStatusLabel(item.status) }}
                  </AdminStatusBadge>
                </td>
                <td class="px-5 py-4 text-sm text-slate-500">
                  <p>{{ item.contactName }}</p>
                  <p class="mt-1 text-xs text-slate-400">{{ item.contactEmail }}</p>
                </td>
                <td class="px-5 py-4 text-sm text-slate-500">
                  {{ new Date(item.createdAt).toLocaleDateString('zh-CN') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 申请详情 -->
      <div class="admin-card p-6">
        <template v-if="selectedApplication">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-4">
              <div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-slate-100 text-lg font-semibold text-slate-600">
                <img v-if="selectedApplication.iconUrl" :alt="selectedApplication.siteName" :src="selectedApplication.iconUrl" class="h-14 w-14 rounded-3xl object-cover">
                <span v-else>{{ selectedApplication.siteName.slice(0, 1).toUpperCase() }}</span>
              </div>
              <div>
                <p class="text-lg font-semibold text-slate-900">{{ selectedApplication.siteName }}</p>
                <a
                  :href="selectedApplication.siteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1 inline-flex text-sm text-blue-600 hover:underline"
                >
                  <svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  打开站点
                </a>
              </div>
            </div>
            <AdminStatusBadge :tone="applicationStatusTone(selectedApplication.status) as any">
              {{ applicationStatusLabel(selectedApplication.status) }}
            </AdminStatusBadge>
          </div>

          <div class="mt-6 rounded-[4px] bg-slate-50 p-5">
            <p class="text-sm font-medium text-slate-900">站点简介</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">{{ selectedApplication.description }}</p>
          </div>

          <div v-if="selectedApplication.message" class="mt-4 rounded-[4px] border border-[var(--admin-border)] p-5">
            <p class="text-sm font-medium text-slate-900">补充说明</p>
            <p class="mt-2 text-sm leading-7 text-slate-600">{{ selectedApplication.message }}</p>
          </div>

          <div class="mt-6 space-y-3 text-sm text-slate-500">
            <p>联系人: {{ selectedApplication.contactName }}</p>
            <p>邮箱: {{ selectedApplication.contactEmail }}</p>
            <p>提交时间: {{ new Date(selectedApplication.createdAt).toLocaleString('zh-CN') }}</p>
            <p>最后更新: {{ new Date(selectedApplication.updatedAt).toLocaleString('zh-CN') }}</p>
            <p>审核时间: {{ selectedApplication.reviewedAt ? new Date(selectedApplication.reviewedAt).toLocaleString('zh-CN') : '尚未审核' }}</p>
            <p>同步状态: {{ selectedApplication.linkedFooterLinkId ? '已同步正式友链' : '尚未同步' }}</p>
          </div>

          <div class="mt-6">
            <label class="mb-2 block text-sm font-medium text-slate-700">审核备注</label>
            <textarea
              v-model="reviewNote"
              class="admin-input min-h-28"
              placeholder="可填写审核说明、互换要求或驳回原因"
            />
          </div>

          <div class="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              class="admin-button-primary"
              :disabled="busyApplicationId === selectedApplication.id"
              @click="handleReview('approved')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              通过并同步
            </button>
            <button
              class="admin-button-secondary"
              :disabled="busyApplicationId === selectedApplication.id"
              @click="handleReview('pending')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              设为待审核
            </button>
            <button
              class="admin-button-danger"
              :disabled="busyApplicationId === selectedApplication.id"
              @click="handleReview('rejected')"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              驳回申请
            </button>
          </div>

          <div class="mt-6 rounded-[4px] border border-dashed border-[var(--admin-border)] px-4 py-3 text-sm text-slate-500">
            通过后会自动创建或启用对应正式友链；设为待审核或驳回后，会自动停用对应正式友链展示。
          </div>
        </template>

        <div v-else class="flex h-full min-h-64 items-center justify-center text-sm text-slate-400">
          请选择一条友情链接申请查看详情。
        </div>
      </div>
    </section>
  </div>
</template>
