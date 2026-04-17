<script setup lang="ts">
import type { PublicSiteSettings } from '~/types/admin-settings'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '管理员设置',
})

const { adminApiFetch, refreshProfile, logout } = useAdminSession()
const { invalidatePublicData } = usePublicDataInvalidation()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const savingAbout = ref(false)
const changingPassword = ref(false)
const error = ref('')
const successMessage = ref('')

const profileForm = ref({
  username: '',
  email: '',
  displayName: '',
})

const aboutForm = ref({
  aboutDisplayName: '',
  aboutBio: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function syncAboutForm(settings: PublicSiteSettings) {
  aboutForm.value = {
    aboutDisplayName: settings.aboutDisplayName ?? '',
    aboutBio: settings.aboutBio ?? '',
  }
}

async function loadProfile() {
  loading.value = true
  error.value = ''

  try {
    const [result, publicSettings] = await Promise.all([
      adminApiFetch<{
        username: string
        email: string
        displayName: string
      }>('/api/v1/admin/auth/me'),
      adminApiFetch<PublicSiteSettings>('/api/v1/admin/site-settings/public'),
    ])

    profileForm.value = {
      username: result.username,
      email: result.email,
      displayName: result.displayName,
    }

    syncAboutForm(publicSettings)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  error.value = ''
  successMessage.value = ''

  try {
    await adminApiFetch('/api/v1/admin/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(profileForm.value),
    })

    await refreshProfile()
    successMessage.value = '保存成功'
    window.setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    saving.value = false
  }
}

async function saveAboutProfile() {
  savingAbout.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const result = await adminApiFetch<PublicSiteSettings>('/api/v1/admin/site-settings/public', {
      method: 'PUT',
      body: JSON.stringify({
        aboutDisplayName: aboutForm.value.aboutDisplayName.trim() || null,
        aboutBio: aboutForm.value.aboutBio.trim() || null,
      }),
    })

    syncAboutForm(result)
    invalidatePublicData({ keys: ['site-settings'] })
    successMessage.value = 'About 资料已保存'
    window.setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  } finally {
    savingAbout.value = false
  }
}

async function changePassword() {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = '两次输入的新密码不一致'
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    error.value = '新密码长度至少为 8 位'
    return
  }

  changingPassword.value = true
  error.value = ''
  successMessage.value = ''

  try {
    await adminApiFetch('/api/v1/admin/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
      }),
    })

    successMessage.value = '密码修改成功，3 秒后将自动退出登录...'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    window.setTimeout(() => {
      logout()
      void router.push('/admin/login')
    }, 3000)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '密码修改失败'
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader
      title="管理员设置"
      description="管理登录账户信息和安全设置。"
    />

    <div v-if="error" class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      {{ error }}
    </div>
    <div v-if="successMessage" class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <div v-if="loading" class="admin-card p-6 text-center text-sm text-slate-500">
      正在加载...
    </div>

    <template v-else>
      <div class="grid gap-6 xl:grid-cols-2">
        <section class="admin-card flex h-full flex-col p-6">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">账户信息</h3>
              <p class="text-sm text-slate-500">修改您的登录邮箱、用户名和显示名称。</p>
            </div>
          </div>

          <div class="flex flex-1 flex-col">
            <div class="space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">用户名</label>
                <input
                  v-model="profileForm.username"
                  type="text"
                  class="admin-input w-full"
                  placeholder="输入用户名"
                >
                <p class="mt-1 text-xs text-slate-500">用于登录后台管理系统</p>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">邮箱地址</label>
                <input
                  v-model="profileForm.email"
                  type="email"
                  class="admin-input w-full"
                  placeholder="输入邮箱地址"
                >
                <p class="mt-1 text-xs text-slate-500">用于接收系统通知和密码重置</p>
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">显示名称</label>
                <input
                  v-model="profileForm.displayName"
                  type="text"
                  class="admin-input w-full"
                  placeholder="输入显示名称"
                >
                <p class="mt-1 text-xs text-slate-500">显示在后台界面中的名称</p>
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-6">
              <button
                class="admin-button-primary"
                :disabled="saving"
                @click="saveProfile"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </section>

        <section class="admin-card flex h-full flex-col p-6">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h6m-6 4h10M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">About 页面资料</h3>
              <p class="text-sm text-slate-500">用于 About 页面的姓名与个人介绍文本。</p>
            </div>
          </div>

          <div class="flex flex-1 flex-col">
            <div class="space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">显示名称</label>
                <input
                  v-model="aboutForm.aboutDisplayName"
                  type="text"
                  class="admin-input w-full"
                  placeholder="例如：Kate"
                >
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">个人介绍</label>
                <textarea
                  v-model="aboutForm.aboutBio"
                  class="admin-textarea min-h-28 w-full"
                  placeholder="用于 About 页面展示"
                />
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-6">
              <button
                class="admin-button-primary"
                :disabled="savingAbout"
                @click="saveAboutProfile"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {{ savingAbout ? '保存中...' : '保存资料' }}
              </button>
            </div>
          </div>
        </section>

        <section class="admin-card flex h-full flex-col p-6">
          <div class="mb-6 flex items-center gap-4">
            <div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-slate-900">修改密码</h3>
              <p class="text-sm text-slate-500">定期更新密码可以提升账户安全性。</p>
            </div>
          </div>

          <div class="flex flex-1 flex-col">
            <div class="space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">当前密码</label>
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="admin-input w-full"
                  placeholder="输入当前密码"
                >
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">新密码</label>
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="admin-input w-full"
                  placeholder="输入新密码（至少 8 位）"
                >
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">确认新密码</label>
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="admin-input w-full"
                  placeholder="再次输入新密码"
                >
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-6">
              <button
                class="admin-button-secondary"
                :disabled="changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword"
                @click="changePassword"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                {{ changingPassword ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>
