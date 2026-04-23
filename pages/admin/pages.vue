<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
});

useHead({
  title: '独立页面',
});

const {
  items,
  loading,
  saving,
  error,
  successMessage,
  activeId,
  activePage,
  sanitizeArticleSlug,
  loadPages,
  savePages,
  updateItem,
  moveItem,
  addPage,
  removePage,
} = useAdminStandalonePages();

onMounted(() => {
  loadPages();
});
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="独立页面"
      description="管理站点中的自定义独立页面。保存后会自动分配数字 slug（例如 /pages/1），也可以手动加入导航菜单。"
    >
      <template #actions>
        <NuxtLink
          v-if="activePage?.slug"
          :to="`/pages/${activePage.slug}`"
          target="_blank"
          class="admin-button-secondary"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          预览页面
        </NuxtLink>
        <button class="admin-button-secondary" :disabled="loading" @click="loadPages">
          <svg class="h-4 w-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          刷新
        </button>
        <button class="admin-button-primary" :disabled="saving" @click="savePages">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          保存独立页面
        </button>
      </template>
    </AdminPageHeader>

    <div
      v-if="error"
      class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
    >
      {{ error }}
    </div>
    <div
      v-if="successMessage"
      class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
    >
      {{ successMessage }}
    </div>

    <div v-if="loading" class="admin-card p-6 text-center text-sm text-slate-500">
      正在加载独立页面...
    </div>

    <template v-if="!loading">
      <section class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside class="admin-card overflow-hidden p-0">
          <div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4">
            <div>
              <h3 class="text-base font-semibold text-slate-900">页面列表</h3>
              <p class="text-sm text-slate-500">Supports sorting, enable/disable, and delete actions.</p>
            </div>
            <button class="admin-button-secondary" type="button" @click="addPage">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              新建
            </button>
          </div>

          <div class="divide-y divide-[var(--admin-border)]">
            <button
              v-for="(item, index) in items"
              :key="item.id"
              class="w-full px-5 py-4 text-left transition"
              :class="item.id === activePage?.id ? 'bg-blue-50' : 'hover:bg-slate-50/70'"
              type="button"
              @click="activeId = item.id"
            >
              <div class="flex items-start gap-3">
                <div class="mt-0.5 flex flex-col gap-1">
                  <button
                    :disabled="index === 0"
                    class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                    title="上移"
                    type="button"
                    @click.stop="moveItem(index, 'up')"
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
                    @click.stop="moveItem(index, 'down')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="truncate font-medium text-slate-900">
                      {{ item.title.trim() || `未命名页面 ${index + 1}` }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      :class="item.enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                    >
                      {{ item.enabled ? '启用' : '禁用' }}
                    </span>
                  </div>
                  <p class="mt-1 truncate text-xs text-slate-500">
                    {{ item.slug ? `/pages/${item.slug}` : 'slug will be generated on save' }}
                  </p>
                  <p class="mt-2 line-clamp-2 text-sm text-slate-600">
                    {{ item.summary.trim() || 'Summary preview will appear here once filled.' }}
                  </p>
                </div>

                <button
                  class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  title="删除"
                  type="button"
                  @click.stop="removePage(item.id)"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </button>
          </div>
        </aside>

        <div v-if="activePage" class="space-y-6">
          <section class="admin-card p-6">
            <div class="mb-4 rounded-[4px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <strong>Tip:</strong> Title and content are required. Slug is optional and auto-generated if left blank.
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  Page Title <span class="text-rose-500">*</span>
                </label>
                <input
                  :value="activePage.title"
                  class="admin-input"
                  placeholder="For example: About This Site"
                  @input="updateItem(activePage.id, item => ({ ...item, title: ($event.target as HTMLInputElement).value }))"
                >
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  Page Slug (optional)
                </label>
                <input
                  :value="activePage.slug"
                  class="admin-input"
                  placeholder="Leave blank to auto-generate"
                  @input="updateItem(activePage.id, item => ({ ...item, slug: sanitizeArticleSlug(($event.target as HTMLInputElement).value) }))"
                >
              </div>

              <div class="flex items-end">
                <label class="flex items-center gap-3">
                  <button
                    :class="activePage.enabled ? 'admin-switch admin-switch-on' : 'admin-switch'"
                    type="button"
                    @click="updateItem(activePage.id, item => ({ ...item, enabled: !item.enabled }))"
                  >
                    <span class="admin-switch-thumb" />
                  </button>
                  <span class="text-sm font-medium text-slate-700">Visible on public site</span>
                </label>
              </div>

              <div class="md:col-span-2">
                <label class="mb-1.5 block text-sm font-medium text-slate-700">
                  Page Summary
                </label>
                <textarea
                  :value="activePage.summary"
                  class="admin-textarea min-h-24"
                  placeholder="Optional short summary shown in page intro and admin list."
                  @input="updateItem(activePage.id, item => ({ ...item, summary: ($event.target as HTMLTextAreaElement).value }))"
                />
              </div>
            </div>
          </section>

          <div class="admin-card overflow-hidden p-0">
            <div class="flex items-center justify-between border-b border-[var(--admin-border)] bg-amber-50/50 px-5 py-3">
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-slate-900">页面内容</span>
                <span class="text-rose-500">*</span>
              </div>
              <span class="text-xs text-slate-500">必填项，使用 Markdown 编写</span>
            </div>

            <MarkdownEditor
              :model-value="activePage.content"
              :disabled="saving"
              placeholder="使用 Markdown 编写页面内容..."
              preview-placeholder="## Start Editing\n\nLive preview appears here."
              upload-usage="article_content"
              media-picker-title="选择页面内图片"
              @update:model-value="updateItem(activePage.id, item => ({ ...item, content: $event }))"
            />
          </div>

          <section class="admin-card p-5">
            <div class="flex items-start gap-3">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div class="space-y-2 text-sm text-slate-600">
                <p>Current URL: {{ activePage.slug ? `/pages/${activePage.slug}` : 'Save page to generate slug automatically' }}</p>
                <p>If you want this page in the public navigation, add a matching link from Content Settings.</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </template>
  </div>
</template>
