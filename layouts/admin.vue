<script setup lang="ts">
import AdminNavIcon from '~/components/admin/AdminNavIcon.vue'
import {
  adminNavSections,
  adminPaths,
  buildAdminCravatarUrl,
  fallbackAdminAvatar,
  getAdminRouteTitle,
  isAdminNavItemActive,
} from '~/utils/admin'
import { useAdminSession } from '~/composables/useAdminSession'

const route = useRoute()
const mobileOpen = ref(false)

/**
 * 锁定 body 滚动（防止弹窗打开时侧栏位置偏移）
 * 使用 padding-right 补偿滚动条宽度避免布局抖动
 */
function lockBodyScroll() {
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
}

/** 解除 body 滚动锁定 */
function unlockBodyScroll() {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}

// 监听所有 admin-modal-overlay 的显示/隐藏
watchEffect(() => {
  // 检查页面上是否存在可见的模态框
  nextTick(() => {
    const hasModal = !!document.querySelector('.admin-modal-overlay')
    if (hasModal) {
      lockBodyScroll()
    } else {
      unlockBodyScroll()
    }
  })
})

const { hydrateSession, profile, logout, refreshProfile } = useAdminSession()

const currentTitle = computed(() => getAdminRouteTitle(route.path))
const profileName = computed(() => profile.value?.displayName || profile.value?.username || 'Admin')
const profileEmail = computed(() => profile.value?.email?.trim() || '')
const profileAvatar = computed(() => {
  if (profileEmail.value) {
    return buildAdminCravatarUrl(profileEmail.value)
  }

  return profile.value?.avatarUrl || fallbackAdminAvatar
})

function closeMobile() {
  mobileOpen.value = false
}

async function handleLogout() {
  logout()
  closeMobile()
  await navigateTo(adminPaths.login)
}

onMounted(async () => {
  hydrateSession()

  try {
    await refreshProfile()
  }
  catch {
    // Keep the shell available and let page-level flows handle invalid sessions.
  }
})

useHead({
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
})
</script>

<template>
  <div class="min-h-screen bg-[var(--admin-bg)] text-slate-900">
    <div class="flex min-h-screen items-start">
      <aside
        class="admin-sidebar-crisp relative z-30 hidden min-h-screen w-[244px] shrink-0 self-stretch bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 lg:block"
      >
        <div class="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div class="border-b border-white/15 px-3 py-3">
          <div class="flex items-center gap-2.5">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
              AK
            </div>
            <div class="min-w-0">
              <p class="truncate text-[13px] font-semibold text-white">AKSRT Blog</p>
              <p class="truncate text-xs text-white/80">后台管理中心</p>
            </div>
          </div>
        </div>

        <div class="px-2.5 py-3">
          <div class="space-y-4">
            <div v-for="section in adminNavSections" :key="section.title">
              <p class="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                {{ section.title }}
              </p>

              <nav class="space-y-0.5">
                <NuxtLink
                  v-for="item in section.items"
                  :key="item.to"
                  :to="item.to"
                  class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium leading-5 transition"
                  :class="
                    isAdminNavItemActive(route.path, item)
                      ? 'bg-white/20 !text-white'
                      : '!text-white/85 hover:bg-white/10 hover:!text-white'
                  "
                >
                  <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                    <AdminNavIcon :name="item.icon" class="h-4 w-4" />
                  </span>
                  <span>{{ item.label }}</span>
                </NuxtLink>
              </nav>
            </div>
          </div>
        </div>

        <div class="mt-auto border-t border-white/15 px-2.5 py-3">
          <div class="space-y-0.5">
            <NuxtLink
              class="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 !text-white/85 transition hover:bg-white/10 hover:!text-white"
              to="/"
            >
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <AdminNavIcon name="home" class="h-4 w-4" />
              </span>
              <span>返回前台</span>
            </NuxtLink>

            <button
              class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 !text-white/85 transition hover:bg-white/10 hover:!text-white"
              type="button"
              @click="handleLogout"
            >
              <span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
                <AdminNavIcon name="logout" class="h-4 w-4" />
              </span>
              <span>退出登录</span>
            </button>
          </div>
        </div>
        </div>
      </aside>

      <div v-if="mobileOpen" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" @click="closeMobile" />
        <aside
          class="admin-sidebar-crisp absolute inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl"
        >
          <div class="shrink-0 flex items-center justify-between border-b border-white/10 px-4 py-4">
            <p class="text-sm font-semibold text-white">菜单</p>
            <button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white" type="button" @click="closeMobile">
              <AdminNavIcon name="close" class="h-4 w-4" />
            </button>
          </div>

          <!-- 可滚动区域 -->
          <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div class="px-3 py-4">
              <div class="space-y-5">
                <div v-for="section in adminNavSections" :key="section.title">
                  <p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">
                    {{ section.title }}
                  </p>

                  <nav class="space-y-1">
                    <NuxtLink
                      v-for="item in section.items"
                      :key="item.to"
                      :to="item.to"
                      class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition"
                      :class="
                        isAdminNavItemActive(route.path, item)
                          ? 'bg-white/20 !text-white'
                          : '!text-white/85 hover:bg-white/10 hover:!text-white'
                      "
                      @click="closeMobile"
                    >
                      <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <AdminNavIcon :name="item.icon" class="h-4 w-4" />
                      </span>
                      <span>{{ item.label }}</span>
                    </NuxtLink>
                  </nav>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部固定操作 -->
          <div class="shrink-0 border-t border-white/15 px-3 py-3">
            <div class="space-y-1">
              <NuxtLink
                class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium !text-white/85 transition hover:bg-white/10 hover:!text-white"
                to="/"
                @click="closeMobile"
              >
                <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <AdminNavIcon name="home" class="h-4 w-4" />
                </span>
                <span>返回前台</span>
              </NuxtLink>

              <button
                class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium !text-white/85 transition hover:bg-white/10 hover:!text-white"
                type="button"
                @click="handleLogout"
              >
                <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <AdminNavIcon name="logout" class="h-4 w-4" />
                </span>
                <span>退出登录</span>
              </button>
            </div>
          </div>
        </aside>
      </div>

      <div class="relative z-0 min-w-0 flex flex-1 flex-col overflow-hidden">
        <header class="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-white/90 backdrop-blur">
          <div class="flex h-16 items-center justify-between px-4 sm:px-6">
            <div class="flex items-center gap-3">
              <button
                class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] text-slate-500 lg:hidden"
                type="button"
                @click="mobileOpen = true"
              >
                <AdminNavIcon name="menu" class="h-4 w-4" />
              </button>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin</p>
                <h1 class="text-base font-semibold text-slate-900">{{ currentTitle }}</h1>
              </div>
            </div>

            <div class="hidden items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-white px-3 py-2 sm:flex">
              <img class="h-9 w-9 rounded-full object-cover" :src="profileAvatar" :alt="profileName" />
              <div>
                <p class="text-sm font-medium text-slate-900">{{ profileName }}</p>
                <p class="text-xs text-slate-500">{{ profileEmail || '未设置邮箱' }}</p>
              </div>
            </div>
          </div>
        </header>

        <main class="min-w-0 flex-1 overflow-x-hidden px-4 py-6 sm:px-6">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>
