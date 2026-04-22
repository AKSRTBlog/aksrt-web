<script setup lang="ts">
import type { AboutContactItem, PublicSiteSettings } from '~/types/admin-settings'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

useHead({
  title: '管理员设置',
})

type ContactDialogForm = {
  name: string
  url: string
}

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
  githubUsername: '',
  aboutContacts: [] as AboutContactItem[],
})

const contactDialogOpen = ref(false)
const contactDialogError = ref('')
const editingContactIndex = ref<number | null>(null)
const contactDialogForm = ref<ContactDialogForm>({
  name: '',
  url: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function createContactId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalizeContactItem(item: Partial<AboutContactItem>) {
  return {
    id: (item.id ?? '').trim() || createContactId(),
    name: (item.name ?? '').trim(),
    url: (item.url ?? '').trim(),
  }
}

function isValidContactUrl(url: string) {
  const value = url.trim().toLowerCase()
  return value.startsWith('http://')
    || value.startsWith('https://')
    || value.startsWith('mailto:')
    || value.startsWith('tel:')
}

function syncAboutForm(settings: PublicSiteSettings) {
  aboutForm.value = {
    aboutDisplayName: settings.aboutDisplayName ?? '',
    aboutBio: settings.aboutBio ?? '',
    githubUsername: settings.githubUsername ?? '',
    aboutContacts: (settings.aboutContacts ?? []).map(normalizeContactItem),
  }
}

function openCreateContactDialog() {
  editingContactIndex.value = null
  contactDialogError.value = ''
  contactDialogForm.value = {
    name: '',
    url: '',
  }
  contactDialogOpen.value = true
}

function openEditContactDialog(index: number) {
  const item = aboutForm.value.aboutContacts[index]
  if (!item) {
    return
  }

  editingContactIndex.value = index
  contactDialogError.value = ''
  contactDialogForm.value = {
    name: item.name,
    url: item.url,
  }
  contactDialogOpen.value = true
}

function closeContactDialog() {
  contactDialogOpen.value = false
  contactDialogError.value = ''
  editingContactIndex.value = null
}

function saveContactDialog() {
  contactDialogError.value = ''

  const name = contactDialogForm.value.name.trim()
  const url = contactDialogForm.value.url.trim()

  if (!name) {
    contactDialogError.value = '联系方式名称不能为空'
    return
  }
  if (!url) {
    contactDialogError.value = '联系方式链接不能为空'
    return
  }
  if (!isValidContactUrl(url)) {
    contactDialogError.value = '链接需以 http://、https://、mailto: 或 tel: 开头'
    return
  }

  const nextContact: AboutContactItem = {
    id:
      editingContactIndex.value !== null
        ? aboutForm.value.aboutContacts[editingContactIndex.value]?.id ?? createContactId()
        : createContactId(),
    name,
    url,
  }

  if (editingContactIndex.value !== null) {
    aboutForm.value.aboutContacts.splice(editingContactIndex.value, 1, nextContact)
  }
  else {
    aboutForm.value.aboutContacts.push(nextContact)
  }

  closeContactDialog()
}

function removeContact(index: number) {
  aboutForm.value.aboutContacts.splice(index, 1)
}

function moveContact(index: number, direction: 'up' | 'down') {
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= aboutForm.value.aboutContacts.length) {
    return
  }
  const [item] = aboutForm.value.aboutContacts.splice(index, 1)
  if (!item) {
    return
  }
  aboutForm.value.aboutContacts.splice(target, 0, item)
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
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
  }
  finally {
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
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  }
  finally {
    saving.value = false
  }
}

async function saveAboutProfile() {
  savingAbout.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const payloadContacts = aboutForm.value.aboutContacts
      .map(normalizeContactItem)
      .filter(item => item.name && item.url)

    for (const item of payloadContacts) {
      if (!isValidContactUrl(item.url)) {
        throw new Error(`联系方式链接不合法: ${item.name}`)
      }
    }

    const result = await adminApiFetch<PublicSiteSettings>('/api/v1/admin/site-settings/public', {
      method: 'PUT',
      body: JSON.stringify({
        aboutDisplayName: aboutForm.value.aboutDisplayName.trim() || null,
        aboutBio: aboutForm.value.aboutBio.trim() || null,
        githubUsername: aboutForm.value.githubUsername.trim() || null,
        aboutContacts: payloadContacts,
      }),
    })

    syncAboutForm(result)
    invalidatePublicData({ keys: ['site-settings'] })
    successMessage.value = 'About 页面资料已保存'
    window.setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '保存失败'
  }
  finally {
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

    successMessage.value = '密码修改成功，3 秒后将自动退出登录'
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }

    window.setTimeout(() => {
      logout()
      void router.push('/admin/login')
    }, 3000)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : '密码修改失败'
  }
  finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader title="管理员设置" description="管理账号信息、关于页资料与安全设置。" />

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
          <h3 class="text-lg font-semibold text-slate-900">账户信息</h3>
          <p class="mt-1 text-sm text-slate-500">修改后台登录用户名、邮箱和显示名称。</p>

          <div class="mt-6 flex flex-1 flex-col">
            <div class="space-y-6">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">用户名</label>
                <input v-model="profileForm.username" type="text" class="admin-input w-full" placeholder="输入用户名">
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">邮箱</label>
                <input v-model="profileForm.email" type="email" class="admin-input w-full" placeholder="输入邮箱地址">
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">显示名称</label>
                <input v-model="profileForm.displayName" type="text" class="admin-input w-full" placeholder="输入显示名称">
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-6">
              <button class="admin-button-primary" :disabled="saving" @click="saveProfile">
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>
          </div>
        </section>

        <section class="admin-card flex h-full flex-col p-6">
          <h3 class="text-lg font-semibold text-slate-900">About 页面资料</h3>
          <p class="mt-1 text-sm text-slate-500">配置关于页名称、简介、Github 用户名与联系方式。</p>

          <div class="mt-6 flex flex-1 flex-col">
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
                <label class="mb-2 block text-sm font-medium text-slate-700">个人简介</label>
                <textarea
                  v-model="aboutForm.aboutBio"
                  class="admin-textarea min-h-28 w-full"
                  placeholder="用于 About 页面展示"
                />
              </div>

              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Github 用户名</label>
                <input
                  v-model="aboutForm.githubUsername"
                  type="text"
                  class="admin-input w-full"
                  placeholder="例如：lexo0522"
                >
              </div>

              <div class="rounded-[4px] border border-[var(--admin-border)] p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">联系方式</p>
                    <p class="mt-1 text-xs text-slate-500">支持多个联系方式，名称和链接可自由配置。</p>
                  </div>
                  <button class="admin-button-secondary" type="button" @click="openCreateContactDialog">
                    新增联系方式
                  </button>
                </div>

                <div v-if="aboutForm.aboutContacts.length === 0" class="mt-4 rounded-[4px] bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  暂无联系方式，点击“新增联系方式”开始配置。
                </div>

                <div v-else class="mt-4 space-y-2">
                  <div
                    v-for="(item, index) in aboutForm.aboutContacts"
                    :key="item.id"
                    class="rounded-[4px] border border-[var(--admin-border)] px-3 py-3"
                  >
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium text-slate-900">{{ item.name }}</p>
                        <p class="mt-1 truncate text-xs text-slate-500">{{ item.url }}</p>
                      </div>
                      <div class="flex gap-2">
                        <button class="admin-button-secondary !px-2 !py-1.5 text-xs" type="button" :disabled="index === 0" @click="moveContact(index, 'up')">上移</button>
                        <button class="admin-button-secondary !px-2 !py-1.5 text-xs" type="button" :disabled="index === aboutForm.aboutContacts.length - 1" @click="moveContact(index, 'down')">下移</button>
                        <button class="admin-button-secondary !px-2 !py-1.5 text-xs" type="button" @click="openEditContactDialog(index)">编辑</button>
                        <button class="admin-button-danger !px-2 !py-1.5 text-xs" type="button" @click="removeContact(index)">删除</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-auto flex gap-3 pt-6">
              <button class="admin-button-primary" :disabled="savingAbout" @click="saveAboutProfile">
                {{ savingAbout ? '保存中...' : '保存资料' }}
              </button>
            </div>
          </div>
        </section>

        <section class="admin-card flex h-full flex-col p-6">
          <h3 class="text-lg font-semibold text-slate-900">修改密码</h3>
          <p class="mt-1 text-sm text-slate-500">定期更新密码有助于提升账号安全。</p>

          <div class="mt-6 flex flex-1 flex-col">
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
                {{ changingPassword ? '修改中...' : '修改密码' }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="contactDialogOpen"
        class="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 sm:items-center sm:px-4 sm:py-6"
        @click.self="closeContactDialog"
      >
        <div class="admin-card w-full max-w-xl rounded-none p-4 sm:rounded-[4px] sm:p-6">
          <div class="flex items-center justify-between gap-3">
            <h4 class="text-base font-semibold text-slate-900">
              {{ editingContactIndex === null ? '新增联系方式' : '编辑联系方式' }}
            </h4>
            <button class="admin-button-secondary !px-3 !py-1.5 text-xs" type="button" @click="closeContactDialog">
              关闭
            </button>
          </div>

          <div class="mt-5 space-y-4">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">名称</label>
              <input v-model="contactDialogForm.name" class="admin-input w-full" placeholder="例如：GitHub、邮箱、公众号">
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">链接地址</label>
              <input
                v-model="contactDialogForm.url"
                class="admin-input w-full"
                placeholder="例如：https://github.com/yourname 或 mailto:you@example.com"
              >
            </div>
          </div>

          <div v-if="contactDialogError" class="mt-4 rounded-[4px] border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {{ contactDialogError }}
          </div>

          <div class="mt-6 flex justify-end gap-3">
            <button class="admin-button-secondary" type="button" @click="closeContactDialog">取消</button>
            <button class="admin-button-primary" type="button" @click="saveContactDialog">确认</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
