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

type PasswordStrengthLevel = 'weak' | 'medium' | 'strong'

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
  aboutContacts: [] as AboutContactItem[],
})

const contactDialogOpen = ref(false)
const contactDialogError = ref('')
const editingContactIndex = ref<number | null>(null)
const draggingContactIndex = ref<number | null>(null)
const dragOverContactIndex = ref<number | null>(null)
const contactDialogForm = ref<ContactDialogForm>({
  name: '',
  url: '',
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) {
    return 'weak'
  }

  let score = 0
  if (password.length >= 8) {
    score += 1
  }
  if (password.length >= 12) {
    score += 1
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1
  }
  if (/\d/.test(password)) {
    score += 1
  }
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1
  }

  if (score >= 5) {
    return 'strong'
  }
  if (score >= 3) {
    return 'medium'
  }
  return 'weak'
}

const passwordStrength = computed(() => {
  const level = getPasswordStrength(passwordForm.value.newPassword)
  if (level === 'strong') {
    return {
      level,
      label: '强',
      barWidth: '100%',
      barClass: 'bg-emerald-500',
      textClass: 'text-emerald-600',
    }
  }
  if (level === 'medium') {
    return {
      level,
      label: '中',
      barWidth: '66%',
      barClass: 'bg-amber-500',
      textClass: 'text-amber-600',
    }
  }
  return {
    level,
    label: '弱',
    barWidth: passwordForm.value.newPassword ? '33%' : '0%',
    barClass: 'bg-rose-500',
    textClass: 'text-rose-600',
  }
})

const canSubmitPasswordChange = computed(() => {
  const { currentPassword, newPassword, confirmPassword } = passwordForm.value
  if (!currentPassword || !newPassword || !confirmPassword) {
    return false
  }
  if (newPassword !== confirmPassword) {
    return false
  }
  if (newPassword === currentPassword) {
    return false
  }
  if (newPassword.length < 8) {
    return false
  }
  return passwordStrength.value.level !== 'weak'
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
  const value = url.trim()
  if (!value) {
    return false
  }

  const lower = value.toLowerCase()
  if (
    lower.startsWith('javascript:')
    || lower.startsWith('data:')
    || lower.startsWith('vbscript:')
    || lower.startsWith('file:')
  ) {
    return false
  }

  if (
    lower.startsWith('http://')
    || lower.startsWith('https://')
    || lower.startsWith('mailto:')
    || lower.startsWith('tel:')
  ) {
    return true
  }

  // Allow custom URL schemes like tencent://, weixin://, tg://, etc.
  return /^[a-z][a-z0-9+.-]*:/.test(lower)
}

function normalizeUrlForCompare(url: string) {
  return url.trim().replace(/\/+$/, '').toLowerCase()
}

function syncAboutForm(settings: PublicSiteSettings) {
  const contacts = (settings.aboutContacts ?? []).map(normalizeContactItem)
  const githubUsername = settings.githubUsername?.trim()

  if (githubUsername) {
    const githubUrl = `https://github.com/${githubUsername}`
    const githubAlreadyExists = contacts.some(item => normalizeUrlForCompare(item.url) === normalizeUrlForCompare(githubUrl))
    if (!githubAlreadyExists) {
      contacts.push({
        id: createContactId(),
        name: 'GitHub',
        url: githubUrl,
      })
    }
  }

  aboutForm.value = {
    aboutDisplayName: settings.aboutDisplayName ?? '',
    aboutBio: settings.aboutBio ?? '',
    aboutContacts: contacts,
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
    contactDialogError.value = '链接需带协议前缀，例如 https://、mailto:、tel:、tencent://'
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

function resetContactDragState() {
  draggingContactIndex.value = null
  dragOverContactIndex.value = null
}

function onContactDragStart(index: number) {
  draggingContactIndex.value = index
  dragOverContactIndex.value = index
}

function onContactDragOver(index: number) {
  if (draggingContactIndex.value === null || draggingContactIndex.value === index) {
    return
  }
  dragOverContactIndex.value = index
}

function onContactDrop(index: number) {
  const sourceIndex = draggingContactIndex.value
  resetContactDragState()
  if (sourceIndex === null || sourceIndex === index) {
    return
  }

  const [item] = aboutForm.value.aboutContacts.splice(sourceIndex, 1)
  if (!item) {
    return
  }

  aboutForm.value.aboutContacts.splice(index, 0, item)
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
        githubUsername: null,
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
  if (
    !passwordForm.value.currentPassword
    || !passwordForm.value.newPassword
    || !passwordForm.value.confirmPassword
  ) {
    error.value = '请完整填写当前密码、新密码和确认密码'
    return
  }

  if (passwordForm.value.newPassword === passwordForm.value.currentPassword) {
    error.value = '新密码不能与当前密码相同'
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    error.value = '两次输入的新密码不一致'
    return
  }

  if (passwordForm.value.newPassword.length < 8) {
    error.value = '新密码长度至少为 8 位'
    return
  }

  if (passwordStrength.value.level === 'weak') {
    error.value = '新密码强度过弱，请至少提升到中等强度'
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
          <p class="mt-1 text-sm text-slate-500">修改后台登录用户名、邮箱、显示名称与密码。</p>

          <div class="mt-6 space-y-6">
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

            <div class="flex gap-3">
              <button class="admin-button-primary" :disabled="saving" @click="saveProfile">
                {{ saving ? '保存中...' : '保存修改' }}
              </button>
            </div>

            <div class="border-t border-[var(--admin-border)] pt-6">
              <h4 class="text-base font-semibold text-slate-900">修改密码</h4>
              <p class="mt-1 text-sm text-slate-500">新密码不能与当前密码相同，建议使用更高强度密码。</p>

              <div class="mt-4 space-y-5">
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

                <div v-if="passwordForm.newPassword" class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50 px-3 py-3">
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-slate-500">密码强度</span>
                    <span class="font-medium" :class="passwordStrength.textClass">{{ passwordStrength.label }}</span>
                  </div>
                  <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      class="h-full rounded-full transition-all duration-200"
                      :class="passwordStrength.barClass"
                      :style="{ width: passwordStrength.barWidth }"
                    />
                  </div>
                  <p class="mt-2 text-xs text-slate-500">建议包含大小写字母、数字与符号，长度 12 位以上更安全。</p>
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

                <div class="flex gap-3">
                  <button
                    class="admin-button-secondary"
                    :disabled="changingPassword || !canSubmitPasswordChange"
                    @click="changePassword"
                  >
                    {{ changingPassword ? '修改中...' : '修改密码' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="admin-card flex h-full flex-col p-6">
          <h3 class="text-lg font-semibold text-slate-900">About 页面资料</h3>
          <p class="mt-1 text-sm text-slate-500">配置关于页名称、简介和联系方式（包含 GitHub）。</p>

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

              <div class="rounded-[4px] border border-[var(--admin-border)] p-4">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-slate-900">联系方式</p>
                    <p class="mt-1 text-xs text-slate-500">支持多个联系方式（含 GitHub），可拖拽或用上下按钮自定义顺序。</p>
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
                    class="rounded-[4px] border border-[var(--admin-border)] px-3 py-3 transition"
                    :class="dragOverContactIndex === index ? 'border-blue-300 bg-blue-50/40' : ''"
                    draggable="true"
                    @dragstart="onContactDragStart(index)"
                    @dragover.prevent="onContactDragOver(index)"
                    @drop.prevent="onContactDrop(index)"
                    @dragend="resetContactDragState"
                  >
                    <div class="flex flex-wrap items-start justify-between gap-2">
                      <div class="min-w-0 flex-1">
                        <p class="mb-1 text-xs text-slate-400">拖拽排序</p>
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

      </div>
    </template>

    <Teleport to="body">
      <div
        v-if="contactDialogOpen"
        class="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/60 sm:items-center sm:px-4 sm:py-6 lg:left-[244px]"
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
