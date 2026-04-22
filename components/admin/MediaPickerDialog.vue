<script setup lang="ts">
import type { MediaAssetItem, MediaUsage } from '~/types/admin'
import {
  formatMediaDate,
  formatMediaSize,
  getMediaKindLabel,
  getMediaUsageLabel,
  readImageDimensions,
} from '~/utils/admin-media'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    emptyMessage?: string
    searchPlaceholder?: string
    uploadUsage?: MediaUsage
  }>(),
  {
    title: '选择媒体',
    emptyMessage: '媒体库还是空的，先上传一张图片吧。',
    searchPlaceholder: '按文件名搜索媒体...',
    uploadUsage: 'article_content',
  },
)

const emit = defineEmits<{
  close: []
  select: [asset: MediaAssetItem]
}>()

const {
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
} = useMediaPicker()

const activeTab = ref<'library' | 'upload'>('library')
const selectedId = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedDimensions = ref<string | null>(null)
const copied = ref(false)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const selectedAsset = computed(() => items.value.find(asset => asset.id === selectedId.value) ?? null)
const currentRangeLabel = computed(() => {
  if (total.value === 0) {
    return '0 / 0'
  }

  const start = (page.value - 1) * pageSize + 1
  const end = Math.min(page.value * pageSize, total.value)
  return `${start}-${end} / ${total.value}`
})

watch(() => props.open, async (isOpen) => {
  if (!isOpen) {
    activeTab.value = 'library'
    selectedId.value = null
    selectedDimensions.value = null
    isDragging.value = false
    copied.value = false
    return
  }

  activeTab.value = 'library'
  resetState()
  await refreshLibrary()
})

watch(items, (nextItems) => {
  if (nextItems.length === 0) {
    selectedId.value = null
    return
  }

  if (!selectedId.value || !nextItems.some(item => item.id === selectedId.value)) {
    selectedId.value = nextItems[0]?.id ?? null
  }
})

watch(selectedAsset, async (asset) => {
  copied.value = false
  selectedDimensions.value = asset ? await readImageDimensions(asset.url) : null
})

async function refreshLibrary(options?: { preserveSelection?: boolean }) {
  const previousSelection = options?.preserveSelection ? selectedId.value : null
  await loadMedia()

  if (previousSelection && items.value.some(item => item.id === previousSelection)) {
    selectedId.value = previousSelection
    return
  }

  selectedId.value = items.value[0]?.id ?? null
}

function handleSearch() {
  page.value = 1
  refreshLibrary()
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

function handleSelect(asset: MediaAssetItem) {
  selectedId.value = asset.id
}

function handleInsert() {
  if (!selectedAsset.value) {
    return
  }

  emit('select', selectedAsset.value)
  emit('close')
}

function normalizeFiles(fileList: FileList | File[]) {
  return Array.from(fileList).filter(file => file.type.startsWith('image/'))
}

async function handleFiles(fileList: FileList | File[]) {
  const files = normalizeFiles(fileList)
  if (files.length === 0) {
    return
  }

  const uploaded = await uploadFiles(files, props.uploadUsage)
  if (uploaded.length === 0) {
    return
  }

  activeTab.value = 'library'
  await refreshLibrary()
  selectedId.value = uploaded[0]?.id ?? items.value[0]?.id ?? null
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.length) {
    handleFiles(target.files)
  }
  target.value = ''
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false

  if (event.dataTransfer?.files?.length) {
    handleFiles(event.dataTransfer.files)
  }
}

async function copySelectedUrl() {
  if (!selectedAsset.value) {
    return
  }

  try {
    await navigator.clipboard.writeText(selectedAsset.value.url)
    copied.value = true
    window.setTimeout(() => {
      copied.value = false
    }, 1600)
  }
  catch {
    copied.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="admin-modal-overlay admin-modal-overlay-adaptive"
      @click.self="emit('close')"
    >
      <div class="admin-card flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-[min(88vh,860px)] sm:max-h-[min(88vh,860px)] sm:rounded-3xl">
        <div class="flex items-center justify-between border-b border-[var(--admin-border)] px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Media Library
            </p>
            <h3 class="mt-1 text-xl font-semibold text-slate-900">
              {{ title }}
            </h3>
          </div>
          <button
            class="admin-button-secondary min-h-10 px-3 py-2"
            type="button"
            @click="emit('close')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-wrap items-center gap-2 border-b border-[var(--admin-border)] bg-slate-50 px-3 py-3 sm:px-4">
          <button
            :class="activeTab === 'library' ? 'admin-button-primary min-h-10' : 'admin-button-secondary min-h-10'"
            type="button"
            @click="activeTab = 'library'"
          >
            媒体库
          </button>
          <button
            :class="activeTab === 'upload' ? 'admin-button-primary min-h-10' : 'admin-button-secondary min-h-10'"
            type="button"
            @click="activeTab = 'upload'"
          >
            上传文件
          </button>
          <div class="hidden text-sm text-slate-500 sm:ml-auto sm:block">
            {{ selectedAsset ? '已选择 1 个媒体项' : '请选择一个媒体资源' }}
          </div>
        </div>

        <div v-if="error" class="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">
          {{ error }}
        </div>

        <div v-if="activeTab === 'upload'" class="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="flex min-h-0 flex-col overflow-y-auto">
            <div class="border-b border-[var(--admin-border)] px-4 py-4 sm:px-5">
              <p class="text-sm text-slate-600">
                拖拽图片到这里，或从本地一次选择多张上传。上传完成后会自动回到媒体库并选中新文件。
              </p>
            </div>

            <div
              class="flex min-h-0 flex-1 items-center justify-center p-4 sm:p-6"
              @dragenter.prevent="isDragging = true"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop="handleDrop"
            >
              <div
                class="flex w-full max-w-2xl flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-10 text-center transition sm:rounded-[2rem] sm:px-8 sm:py-16"
                :class="isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/80'"
              >
                <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
                  <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-slate-900">
                  {{ uploading ? '正在上传媒体...' : '拖拽文件到此处上传' }}
                </h4>
                <p class="mt-2 max-w-lg text-sm leading-7 text-slate-500">
                  支持 JPG、PNG、GIF、WebP、SVG。建议上传清晰并压缩过的图片，媒体用途会按当前场景自动标记。
                </p>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  multiple
                  class="hidden"
                  @change="handleFileChange"
                >
                <button
                  class="admin-button-primary mt-6 w-full sm:w-auto"
                  :disabled="uploading"
                  type="button"
                  @click="fileInput?.click()"
                >
                  {{ uploading ? '上传中...' : '选择文件' }}
                </button>
              </div>
            </div>
          </div>

          <aside class="hidden border-l border-[var(--admin-border)] bg-slate-50/60 p-5 lg:block">
            <div class="space-y-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Tips
                </p>
                <h4 class="mt-2 text-base font-semibold text-slate-900">
                  上传建议
                </h4>
              </div>
              <ul class="space-y-3 text-sm leading-7 text-slate-600">
                <li>建议一次上传同一批会使用到的图片，后续筛选更清晰。</li>
                <li>Banner 和封面图尽量保持横向比例，便于前台复用。</li>
                <li>上传完成后会自动回到媒体库，你可以立即查看详情并插入。</li>
              </ul>
            </div>
          </aside>
        </div>

        <div v-else class="grid min-h-0 flex-1 grid-cols-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_320px]">
          <div class="flex min-h-0 flex-col">
            <div class="flex flex-col gap-3 border-b border-[var(--admin-border)] px-3 py-3 sm:flex-row sm:px-4 sm:py-4">
              <div class="flex-1">
                <input
                  v-model="keyword"
                  class="admin-input"
                  :placeholder="searchPlaceholder"
                  @keyup.enter="handleSearch"
                >
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="admin-button-secondary min-h-10" type="button" @click="handleSearch">
                  搜索
                </button>
                <button class="admin-button-secondary min-h-10" type="button" @click="refreshLibrary({ preserveSelection: true })">
                  刷新
                </button>
              </div>
            </div>

            <div class="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-3 sm:p-4">
              <div v-if="loading" class="flex h-full min-h-60 items-center justify-center text-sm text-slate-500">
                正在加载媒体库...
              </div>

              <div v-else-if="items.length === 0" class="flex h-full min-h-60 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 text-center">
                <p class="text-base font-medium text-slate-700">
                  {{ emptyMessage }}
                </p>
                <p class="mt-2 text-sm text-slate-500">
                  你可以先切换到“上传文件”，再回来选择需要插入的媒体。
                </p>
              </div>

              <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
                <button
                  v-for="asset in items"
                  :key="asset.id"
                  class="group overflow-hidden rounded-[1.25rem] border bg-white text-left transition"
                  :class="selectedId === asset.id ? 'border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]' : 'border-[var(--admin-border)] hover:border-slate-300'"
                  type="button"
                  @click="handleSelect(asset)"
                >
                  <div class="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      :src="asset.url"
                      :alt="asset.originalFilename"
                      class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                    >
                    <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3">
                      <div class="flex items-center justify-between gap-2 text-[11px] text-white/90">
                        <span class="rounded-full bg-white/15 px-2 py-1 font-medium backdrop-blur">
                          {{ getMediaUsageLabel(asset.usage) }}
                        </span>
                        <span>{{ formatMediaSize(asset.size) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1 px-3 py-3">
                    <p class="truncate text-sm font-medium text-slate-800">
                      {{ asset.originalFilename }}
                    </p>
                    <p class="truncate text-xs text-slate-500">
                      {{ formatMediaDate(asset.createdAt) }}
                    </p>
                  </div>
                </button>
              </div>

              <div v-if="selectedAsset" class="mt-3 rounded-2xl border border-[var(--admin-border)] bg-white p-3 lg:hidden">
                <div class="flex items-start gap-3">
                  <img
                    :src="selectedAsset.url"
                    :alt="selectedAsset.originalFilename"
                    class="h-16 w-16 shrink-0 rounded-xl object-cover"
                  >
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-slate-900">
                      {{ selectedAsset.title || selectedAsset.originalFilename }}
                    </p>
                    <p class="mt-1 truncate text-xs text-slate-500">
                      {{ formatMediaSize(selectedAsset.size) }} | {{ selectedDimensions || '...' }}
                    </p>
                    <p class="mt-1 truncate text-xs text-slate-500">
                      {{ getMediaUsageLabel(selectedAsset.usage) }}
                    </p>
                  </div>
                </div>
                <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button class="admin-button-secondary min-h-10" type="button" @click="copySelectedUrl">
                    {{ copied ? '已复制' : '复制链接' }}
                  </button>
                  <a
                    class="admin-button-secondary min-h-10 text-center"
                    :href="selectedAsset.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    打开原图
                  </a>
                </div>
              </div>
            </div>

            <div class="border-t border-[var(--admin-border)] px-3 py-3 sm:px-5">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="text-sm text-slate-500">
                  {{ currentRangeLabel }}
                </div>
                <div class="flex gap-2">
                  <button
                    class="admin-button-secondary min-h-10"
                    :disabled="page <= 1"
                    type="button"
                    @click="handlePageChange('prev')"
                  >
                    上一页
                  </button>
                  <button
                    class="admin-button-secondary min-h-10"
                    :disabled="page >= totalPages"
                    type="button"
                    @click="handlePageChange('next')"
                  >
                    下一页
                  </button>
                </div>
                <div class="flex w-full gap-2 lg:hidden">
                  <button
                    class="admin-button-primary min-h-10 flex-1"
                    :disabled="!selectedAsset"
                    type="button"
                    @click="handleInsert"
                  >
                    插入所选媒体
                  </button>
                  <button class="admin-button-secondary min-h-10 flex-1" type="button" @click="emit('close')">
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside class="hidden min-h-0 flex-col border-l border-[var(--admin-border)] bg-white lg:flex">
            <div class="border-b border-[var(--admin-border)] px-5 py-4">
              <p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Attachment Details
              </p>
              <h4 class="mt-2 text-base font-semibold text-slate-900">
                附件详情
              </h4>
            </div>

            <div v-if="selectedAsset" class="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div class="space-y-5">
                <div class="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-slate-100">
                  <img
                    :src="selectedAsset.url"
                    :alt="selectedAsset.originalFilename"
                    class="h-56 w-full object-cover"
                  >
                </div>

                <div class="space-y-2">
                  <h5 class="break-all text-base font-semibold text-slate-900">
                    {{ selectedAsset.title || selectedAsset.originalFilename }}
                  </h5>
                  <p class="break-all text-sm text-slate-500">
                    {{ selectedAsset.originalFilename }}
                  </p>
                </div>

                <dl class="space-y-3 text-sm">
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">文件类型</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ getMediaKindLabel(selectedAsset) }} / {{ selectedAsset.mimeType }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">文件大小</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ formatMediaSize(selectedAsset.size) }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">媒体用途</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ getMediaUsageLabel(selectedAsset.usage) }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">尺寸</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ selectedDimensions || '读取中...' }}
                    </dd>
                  </div>
                  <div class="flex items-start justify-between gap-4">
                    <dt class="text-slate-500">Alt 文本</dt>
                    <dd class="text-right font-medium text-slate-800">
                      {{ selectedAsset.altText || '未填写' }}
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
                    class="admin-textarea min-h-28 text-xs leading-6"
                    readonly
                  />
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button class="admin-button-secondary" type="button" @click="copySelectedUrl">
                    {{ copied ? '已复制' : '复制链接' }}
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
              </div>
            </div>

            <div v-else class="flex flex-1 items-center justify-center px-6 text-center text-sm leading-7 text-slate-500">
              从左侧媒体网格中选择一项，这里会显示与 WordPress 类似的附件详情信息。
            </div>

            <div class="border-t border-[var(--admin-border)] px-5 py-4">
              <div class="flex flex-col gap-3">
                <button
                  class="admin-button-primary w-full"
                  :disabled="!selectedAsset"
                  type="button"
                  @click="handleInsert"
                >
                  插入所选媒体
                </button>
                <button class="admin-button-secondary w-full" type="button" @click="emit('close')">
                  取消
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </Teleport>
</template>

