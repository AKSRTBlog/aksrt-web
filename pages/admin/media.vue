<script setup lang="ts">
import type { MediaAssetItem, MediaUsage } from '~/types/admin'
import {
  formatMediaDate,
  getMediaExtension,
  getMediaKindLabel,
  getMediaUsageLabel,
  mediaSortOptions,
  readImageDimensions,
} from '~/utils/admin-media'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '媒体资源',
})

const {
  items,
  loading,
  uploading,
  error,
  successMessage,
  keyword,
  sortBy,
  page,
  pageSize,
  total,
  totalPages,
  loadItems,
  uploadFiles,
  deleteFile,
  copyUrl,
  formatSize,
} = useAdminMedia()

const fileInput = ref<HTMLInputElement | null>(null)
const searchDraft = ref('')
const selectedId = ref<string | null>(null)
const selectedDimensions = ref<string | null>(null)
const isDragging = ref(false)
const dragDepth = ref(0)
const detailsOpen = ref(false)

const selectedAsset = computed(() => items.value.find(asset => asset.id === selectedId.value) ?? null)

const currentRangeLabel = computed(() => {
  if (total.value === 0) {
    return '0 / 0'
  }

  const start = (page.value - 1) * pageSize + 1
  const end = Math.min(page.value * pageSize, total.value)
  return `${start}-${end} / ${total.value}`
})

watch(items, (nextItems) => {
  if (nextItems.length === 0) {
    selectedId.value = null
    detailsOpen.value = false
    return
  }

  if (selectedId.value && !nextItems.some(item => item.id === selectedId.value)) {
    selectedId.value = null
    detailsOpen.value = false
  }
})

watch(selectedAsset, async (asset) => {
  if (!asset) {
    selectedDimensions.value = null
    return
  }

  selectedDimensions.value = await readImageDimensions(asset.url)
})

function syncPageScrollLock(open: boolean) {
  if (!import.meta.client) {
    return
  }

  const scrollbarWidth = Math.max(window.innerWidth - document.documentElement.clientWidth, 0)
  const compensation = open && scrollbarWidth > 0 ? `${scrollbarWidth}px` : ''

  document.documentElement.style.overflow = open ? 'hidden' : ''
  document.body.style.overflow = open ? 'hidden' : ''
  document.documentElement.style.paddingRight = compensation
  document.body.style.paddingRight = compensation
}

watch(detailsOpen, (open) => {
  syncPageScrollLock(open)
})

onMounted(async () => {
  await refreshLibrary()
  searchDraft.value = keyword.value
})

onBeforeUnmount(() => {
  syncPageScrollLock(false)
})

async function refreshLibrary(options?: { preserveSelection?: boolean }) {
  const previousSelection = options?.preserveSelection ? selectedId.value : null
  await loadItems()

  if (previousSelection && items.value.some(item => item.id === previousSelection)) {
    selectedId.value = previousSelection
  }
}

function applyFilters() {
  keyword.value = searchDraft.value.trim()
  page.value = 1
  refreshLibrary({ preserveSelection: true })
}

function applySelectFilter() {
  page.value = 1
  refreshLibrary({ preserveSelection: true })
}

function handlePageChange(direction: 'prev' | 'next') {
  if (direction === 'prev' && page.value > 1) {
    page.value -= 1
    refreshLibrary({ preserveSelection: true })
  }

  if (direction === 'next' && page.value < totalPages.value) {
    page.value += 1
    refreshLibrary({ preserveSelection: true })
  }
}

async function handleFiles(fileList: FileList | File[]) {
  const uploaded = await uploadFiles(fileList, 'misc' as MediaUsage)
  if (uploaded.length > 0) {
    selectedId.value = uploaded[0]?.id ?? null
  }
}

function openFilePicker() {
  fileInput.value?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    handleFiles(target.files)
  }
  target.value = ''
}

function handleDragEnter(event: DragEvent) {
  event.preventDefault()

  if (!event.dataTransfer?.types.includes('Files')) {
    return
  }

  dragDepth.value += 1
  isDragging.value = true
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()

  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }

  if (event.dataTransfer?.types.includes('Files')) {
    isDragging.value = true
  }
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()

  if (!event.dataTransfer?.types.includes('Files')) {
    return
  }

  dragDepth.value = Math.max(dragDepth.value - 1, 0)
  if (dragDepth.value === 0) {
    isDragging.value = false
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragDepth.value = 0
  isDragging.value = false

  if (event.dataTransfer?.files?.length) {
    handleFiles(event.dataTransfer.files)
  }
}

async function handleDeleteSelected() {
  if (!selectedAsset.value) {
    return
  }

  const deleted = await deleteFile(selectedAsset.value)
  if (deleted) {
    closeDetailsModal()
  }
}

function openDetails(asset: MediaAssetItem) {
  selectedId.value = asset.id
  detailsOpen.value = true
}

function closeDetailsModal() {
  detailsOpen.value = false
  selectedId.value = null
}
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="媒体资源"
      description="按 WordPress 媒体库的浏览方式集中管理站点图片素材，点击卡片即可用弹窗查看附件详情。"
    >
      <template #actions>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="handleFileChange"
        >
      </template>
    </AdminPageHeader>

    <div v-if="error" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </div>
    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div
      class="admin-card p-4 sm:p-5"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div
        class="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed px-5 py-8 text-center transition sm:px-8 sm:py-10"
        :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/50'"
        role="button"
        tabindex="0"
        @click="openFilePicker"
        @keydown.enter.prevent="openFilePicker"
        @keydown.space.prevent="openFilePicker"
      >
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-slate-900">
          {{ uploading ? '正在上传媒体...' : '拖拽图片到这里，或点击这里上传' }}
        </h3>
        <p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
          支持 JPG、PNG、GIF、WebP、SVG。适合批量拖入素材，上传完成后会自动出现在下方媒体库中。
        </p>
        <button
          class="admin-button-secondary mt-5"
          :disabled="uploading"
          type="button"
          @click.stop="openFilePicker"
        >
          {{ uploading ? '上传中...' : '选择文件' }}
        </button>
      </div>
    </div>

    <div class="admin-card p-4">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="min-w-0 flex-1">
          <AdminSearchField
            v-model="searchDraft"
            placeholder="按文件名搜索媒体..."
            @keyup.enter="applyFilters"
          />
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
          <select v-model="sortBy" class="admin-select min-w-0 sm:w-40" @change="applySelectFilter">
            <option v-for="option in mediaSortOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>

          <button
            class="admin-button-secondary whitespace-nowrap"
            type="button"
            @click="applyFilters"
          >
            搜索
          </button>
        </div>
      </div>
    </div>

    <section>
      <div
        class="admin-card relative overflow-hidden"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
      >
        <div
          v-if="isDragging"
          class="absolute inset-4 z-10 flex items-center justify-center rounded-[1.75rem] border-2 border-dashed border-blue-500 bg-blue-50/95 text-center text-sm font-medium text-blue-700 backdrop-blur"
        >
          松开鼠标即可上传到媒体库
        </div>

        <div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Library
            </p>
            <h3 class="mt-1 text-lg font-semibold text-slate-900">
              媒体网格
            </h3>
          </div>
          <p class="text-sm text-slate-500">
            {{ uploading ? '正在上传，请稍候...' : '支持拖拽批量上传，点击卡片查看详情' }}
          </p>
        </div>

        <div v-if="loading" class="flex min-h-[440px] items-center justify-center px-6 text-sm text-slate-500">
          正在加载媒体资源...
        </div>

        <div v-else-if="items.length === 0" class="flex min-h-[440px] flex-col items-center justify-center px-6 text-center">
          <p class="text-base font-medium text-slate-700">
            媒体库里还没有符合筛选条件的内容
          </p>
          <p class="mt-2 text-sm text-slate-500">
            拖拽图片到这里，或点击右上角“上传文件”补充素材。
          </p>
        </div>

        <div v-else>
          <div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 xl:grid-cols-4 2xl:grid-cols-5">
            <button
              v-for="item in items"
              :key="item.id"
              class="group overflow-hidden rounded-[1.25rem] border bg-white text-left transition"
              :class="selectedId === item.id ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]' : 'border-[var(--admin-border)] hover:border-slate-300'"
              type="button"
              @click="openDetails(item)"
            >
              <div class="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  :src="item.url"
                  :alt="item.originalFilename"
                  class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                >
                <div class="absolute inset-x-0 top-0 flex items-center justify-between px-2.5 py-2.5 sm:px-3 sm:py-3">
                  <span class="rounded-full bg-slate-950/65 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    {{ getMediaExtension(item) }}
                  </span>
                  <span
                    v-if="selectedId === item.id"
                    class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-2.5 py-2.5 sm:px-3 sm:py-3">
                  <div class="flex items-center justify-between gap-2 text-[11px] text-white/90">
                    <span class="truncate rounded-full bg-white/15 px-2 py-1 font-medium backdrop-blur">
                      {{ getMediaUsageLabel(item.usage) }}
                    </span>
                    <span>{{ formatSize(item.size) }}</span>
                  </div>
                </div>
              </div>
              <div class="space-y-0.5 px-3 py-2.5">
                <p class="truncate text-sm font-medium text-slate-800">
                  {{ item.title || item.originalFilename }}
                </p>
                <p class="truncate text-xs text-slate-500">
                  {{ formatMediaDate(item.createdAt) }}
                </p>
              </div>
            </button>
          </div>

          <div class="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-4">
            <p class="text-sm text-slate-500">
              {{ currentRangeLabel }}
            </p>
            <div class="flex gap-2">
              <button
                class="admin-button-secondary"
                :disabled="page <= 1"
                type="button"
                @click="handlePageChange('prev')"
              >
                上一页
              </button>
              <button
                class="admin-button-secondary"
                :disabled="page >= totalPages"
                type="button"
                @click="handlePageChange('next')"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Teleport to="body">
      <div
        v-if="detailsOpen && selectedAsset"
        class="admin-modal-overlay admin-modal-overlay-adaptive"
        @click.self="closeDetailsModal"
      >
        <div class="admin-card flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-[min(90vh,900px)] sm:max-h-[min(90vh,900px)] sm:rounded-[4px]">
          <div class="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-4 sm:px-6">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Attachment Details
              </p>
              <h3 class="mt-1 text-xl font-semibold text-slate-900">
                附件详情
              </h3>
            </div>
            <button
              class="admin-button-secondary px-3 py-2"
              type="button"
              @click="closeDetailsModal"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
            <div class="min-h-0 flex-1 overflow-hidden bg-slate-50/70 p-4 sm:p-5">
              <div class="flex flex-wrap items-center gap-2 pb-3">
                <span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {{ getMediaExtension(selectedAsset) }}
                </span>
                <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {{ getMediaUsageLabel(selectedAsset.usage) }}
                </span>
                <span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                  {{ formatSize(selectedAsset.size) }}
                </span>
              </div>

              <div class="flex h-[38vh] min-h-[16rem] max-h-[24rem] items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-slate-100 sm:h-[44vh] sm:max-h-[30rem] xl:h-[calc(90vh-11rem)] xl:min-h-0 xl:max-h-none">
                <img
                  :src="selectedAsset.url"
                  :alt="selectedAsset.originalFilename"
                  class="max-h-full max-w-full object-contain"
                >
              </div>
            </div>

            <aside class="min-h-0 border-t border-[var(--admin-border)] bg-white p-4 xl:w-[320px] xl:flex-none xl:border-l xl:border-t-0">
              <div class="flex flex-col gap-4">
                <div class="space-y-2">
                  <h4 class="break-all text-base font-semibold text-slate-900">
                    {{ selectedAsset.title || selectedAsset.originalFilename }}
                  </h4>
                  <p class="break-all text-sm text-slate-500">
                    {{ selectedAsset.originalFilename }}
                  </p>
                </div>

                <dl class="space-y-2.5 text-sm">
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">媒体类型</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ getMediaKindLabel(selectedAsset) }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">MIME</dt>
                    <dd class="break-all text-right font-medium text-slate-800">
                      {{ selectedAsset.mimeType }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">用途</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ getMediaUsageLabel(selectedAsset.usage) }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">大小</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ formatSize(selectedAsset.size) }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">尺寸</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ selectedDimensions || '读取中...' }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">上传时间</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ formatMediaDate(selectedAsset.createdAt) }}
                    </dd>
                  </div>
                </dl>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-slate-700">文件地址</label>
                  <textarea
                    :value="selectedAsset.url"
                    class="admin-textarea min-h-20 text-xs leading-5"
                    readonly
                  />
                </div>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button class="admin-button-secondary" type="button" @click="copyUrl(selectedAsset.url)">
                    复制链接
                  </button>
                  <a
                    class="admin-button-secondary text-center"
                    :href="selectedAsset.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开原图
                  </a>
                </div>

                <button class="admin-button-danger w-full" type="button" @click="handleDeleteSelected">
                  删除此媒体
                </button>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
