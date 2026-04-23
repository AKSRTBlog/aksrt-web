<script setup lang="ts">
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha'
import { useAdminSession } from '~/composables/useAdminSession'
import type { AdminCaptchaResult, CommentCaptchaDebugResult } from '~/types/admin'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
  alias: ['/admin/settings/index'],
})

useHead({
  title: '站点设置',
})

const {
  loading,
  saving,
  testingSmtp,
  error,
  successMessage,
  publicForm,
  customCodeForm,
  storageForm,
  smtpForm,
  captchaConfig,
  captchaForm,
  loadSettings,
  savePublicSettings,
  saveCustomCode,
  saveStorageSettings,
  saveSmtpSettings,
  testSmtpSettings,
  saveCaptchaSettings,
} = useAdminSiteSettings()

const { adminApiFetch } = useAdminSession()

const activeTab = ref('general')
const captchaDebugArticleSlug = ref('1')
const captchaDebugMessage = ref('')
const captchaDebugResult = ref<CommentCaptchaDebugResult | null>(null)
const captchaDebugPayload = ref<AdminCaptchaResult | null>(null)
const runningCaptchaDebug = ref(false)

const savedCommentCaptchaId = computed(() => {
  if (!captchaConfig.value?.enabled || !captchaConfig.value.enabledOnComment) {
    return null
  }

  const value = captchaConfig.value.captchaId.trim()
  return value || null
})

const tabs = [
  { id: 'general', label: '常规' },
  { id: 'customCode', label: '自定义代码' },
  { id: 'storage', label: '存储' },
  { id: 'smtp', label: 'SMTP' },
  { id: 'security', label: '安全' },
]

async function runCommentCaptchaDebug(captcha: AdminCaptchaResult) {
  runningCaptchaDebug.value = true
  captchaDebugMessage.value = ''
  captchaDebugResult.value = null

  try {
    const result = await adminApiFetch<CommentCaptchaDebugResult>(
      '/api/v1/admin/site-settings/captcha/debug/comment',
      {
        method: 'POST',
        body: JSON.stringify({
          slug: captchaDebugArticleSlug.value.trim(),
          captcha,
        }),
      },
    )

    captchaDebugResult.value = result
    captchaDebugMessage.value = result.message
  } catch (error) {
    captchaDebugMessage.value = error instanceof Error ? error.message : 'Comment captcha debug failed.'
  } finally {
    runningCaptchaDebug.value = false
  }
}

const { loaded: captchaDebugLoaded, showCaptcha: showCaptchaDebug } = useGeeTestCaptcha(
  savedCommentCaptchaId,
  async (result) => {
    captchaDebugPayload.value = result
    await runCommentCaptchaDebug(result)
  },
  (error) => {
    captchaDebugMessage.value = error.message
  },
)

async function startCommentCaptchaDebug() {
  captchaDebugMessage.value = ''
  captchaDebugResult.value = null
  captchaDebugPayload.value = null

  if (!captchaDebugArticleSlug.value.trim()) {
    captchaDebugMessage.value = 'Please enter an article slug first.'
    return
  }

  if (!captchaConfig.value?.enabled) {
    captchaDebugMessage.value = 'The saved captcha config is disabled. Save an enabled config first.'
    return
  }

  if (!captchaConfig.value.enabledOnComment) {
    captchaDebugMessage.value = 'The saved captcha config is not enabled for comments.'
    return
  }

  if (!captchaConfig.value.captchaId.trim()) {
    captchaDebugMessage.value = 'The saved captcha ID is empty.'
    return
  }

  if (!captchaConfig.value.captchaKeyConfigured) {
    captchaDebugMessage.value = 'The saved captcha key is missing. Save it before running the debug flow.'
    return
  }

  if (!captchaDebugLoaded.value) {
    captchaDebugMessage.value = 'Captcha is still loading. Please try again in a moment.'
    return
  }

  showCaptchaDebug()
}

onMounted(async () => {
  await loadSettings()
})
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader title="站点设置" description="配置站点的基本信息、存储、SMTP 等设置。">
      <template #actions>
        <NuxtLink class="admin-button-secondary" to="/admin">返回控制台</NuxtLink>
      </template>
    </AdminPageHeader>

    <!-- 错误/成功提示 -->
    <div v-if="error" class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
      {{ error }}
    </div>
    <div v-if="successMessage" class="admin-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      {{ successMessage }}
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="admin-card px-5 py-10 text-center text-sm text-slate-500">
      正在加载设置...
    </div>

    <template v-else>
      <!-- 标签页导航 -->
      <div class="admin-card p-1">
        <nav class="flex gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="admin-tab-button"
            :class="{ 'admin-tab-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>

      <!-- 常规设置 -->
      <div v-if="activeTab === 'general'" class="admin-card p-6">
        <h3 class="mb-6 text-lg font-semibold text-slate-900">常规设置</h3>

        <div class="grid gap-6 lg:grid-cols-2">
          <div>
            <label class="admin-label">站点标题</label>
            <input v-model="publicForm.siteTitle" class="admin-input" placeholder="输入站点标题" />
          </div>

          <div class="lg:col-span-2">
            <label class="admin-label">站点描述</label>
            <input v-model="publicForm.siteDescription" class="admin-input" placeholder="输入站点描述" />
          </div>

          <div class="lg:col-span-2">
            <label class="admin-label">Logo URL</label>
            <input v-model="publicForm.logoUrl" class="admin-input" placeholder="https://example.com/logo.png" />
          </div>

          <div class="lg:col-span-2">
            <label class="admin-label">SEO 关键词</label>
            <input v-model="publicForm.seoKeywords" class="admin-input" placeholder="keyword1, keyword2, keyword3" />
          </div>

          <div>
            <label class="admin-label">Article layout</label>
            <select v-model="publicForm.articleLayout" class="admin-select">
              <option value="list">List</option>
              <option value="grid">Grid</option>
            </select>
          </div>

          <div class="lg:col-span-2">
            <label class="admin-checkbox-label">
              <input v-model="publicForm.commentEnabled" type="checkbox" class="admin-checkbox" />
              <span>启用评论功能</span>
            </label>
          </div>

          <div class="lg:col-span-2">
            <label class="admin-checkbox-label">
              <input v-model="publicForm.showFiling" type="checkbox" class="admin-checkbox" />
              <span>显示备案信息</span>
            </label>
          </div>

          <div>
            <label class="admin-label">ICP 备案号</label>
            <input v-model="publicForm.icpFiling" class="admin-input" placeholder="京ICP备xxxxxxx号" />
          </div>

          <div>
            <label class="admin-label">公安联网备案号</label>
            <input v-model="publicForm.policeFiling" class="admin-input" placeholder="xxxx-xxxx" />
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="admin-button-primary" :disabled="saving" @click="savePublicSettings">
            {{ saving ? '保存中...' : '保存设置' }}
          </button>
        </div>
      </div>

      <!-- 自定义代码 -->
      <div v-if="activeTab === 'customCode'" class="admin-card p-6">
        <h3 class="mb-6 text-lg font-semibold text-slate-900">自定义代码</h3>

        <div class="space-y-6">
          <div>
            <label class="admin-label">Head 代码（会插入到 &lt;head&gt; 标签内）</label>
            <textarea
              v-model="customCodeForm.customHeadCode"
              class="admin-textarea min-h-40 font-mono text-sm"
              placeholder="<!-- 插入自定义代码 -->"
            />
          </div>

          <div>
            <label class="admin-label">Footer 代码（会插入到页面底部）</label>
            <textarea
              v-model="customCodeForm.customFooterCode"
              class="admin-textarea min-h-40 font-mono text-sm"
              placeholder="<!-- 插入自定义代码 -->"
            />
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="admin-button-primary" :disabled="saving" @click="saveCustomCode">
            {{ saving ? '保存中...' : '保存代码' }}
          </button>
        </div>
      </div>

      <!-- 存储设置 -->
      <div v-if="activeTab === 'storage'" class="admin-card p-6">
        <h3 class="mb-6 text-lg font-semibold text-slate-900">存储设置</h3>

        <div class="space-y-6">
          <div>
            <label class="admin-checkbox-label">
              <input v-model="storageForm.enabled" type="checkbox" class="admin-checkbox" />
              <span>启用外部存储</span>
            </label>
          </div>

          <div>
            <label class="admin-label">存储驱动</label>
            <select v-model="storageForm.driver" class="admin-select">
              <option value="local">本地存储</option>
              <option value="aliyun-oss">阿里云 OSS</option>
              <option value="tencent-cos">腾讯云 COS</option>
              <option value="s3-compatible">S3 兼容存储</option>
            </select>
          </div>

          <div v-if="storageForm.driver !== 'local'">
            <div class="grid gap-6 lg:grid-cols-2">
              <div>
                <label class="admin-label">Endpoint</label>
                <input v-model="storageForm.endpoint" class="admin-input" placeholder="https://oss-cn-hangzhou.aliyuncs.com" />
              </div>

              <div>
                <label class="admin-label">地域</label>
                <input v-model="storageForm.region" class="admin-input" placeholder="oss-cn-hangzhou" />
              </div>

              <div>
                <label class="admin-label">Bucket</label>
                <input v-model="storageForm.bucket" class="admin-input" placeholder="my-blog-bucket" />
              </div>

              <div>
                <label class="admin-label">Access Key ID</label>
                <input v-model="storageForm.accessKeyId" class="admin-input" placeholder="your-access-key-id" />
              </div>

              <div>
                <label class="admin-label">Secret Access Key</label>
                <input v-model="storageForm.secretAccessKey" type="password" class="admin-input" placeholder="留空则不更新" />
              </div>

              <div>
                <label class="admin-label">公共基础 URL</label>
                <input v-model="storageForm.publicBaseUrl" class="admin-input" placeholder="https://your-cdn.example.com" />
              </div>

              <div>
                <label class="admin-label">基础目录</label>
                <input v-model="storageForm.baseFolder" class="admin-input" placeholder="blog" />
              </div>

              <div>
                <label class="admin-checkbox-label mt-8">
                  <input v-model="storageForm.forcePathStyle" type="checkbox" class="admin-checkbox" />
                  <span>强制 Path Style</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="admin-button-primary" :disabled="saving" @click="saveStorageSettings">
            {{ saving ? '保存中...' : '保存存储设置' }}
          </button>
        </div>
      </div>

      <!-- SMTP 设置 -->
      <div v-if="activeTab === 'smtp'" class="admin-card p-6">
        <h3 class="mb-6 text-lg font-semibold text-slate-900">SMTP 邮件设置</h3>

        <div class="space-y-6">
          <div>
            <label class="admin-checkbox-label">
              <input v-model="smtpForm.enabled" type="checkbox" class="admin-checkbox" />
              <span>启用 SMTP 发送邮件</span>
            </label>
          </div>

          <div v-if="smtpForm.enabled">
            <div class="grid gap-6 lg:grid-cols-2">
              <div>
                <label class="admin-label">SMTP 服务器</label>
                <input v-model="smtpForm.host" class="admin-input" placeholder="smtp.example.com" />
              </div>

              <div>
                <label class="admin-label">端口</label>
                <input v-model="smtpForm.port" type="number" class="admin-input" placeholder="587" />
              </div>

              <div>
                <label class="admin-checkbox-label mt-8">
                  <input v-model="smtpForm.secure" type="checkbox" class="admin-checkbox" />
                  <span>使用 SSL/TLS</span>
                </label>
              </div>

              <div>
                <label class="admin-label">用户名</label>
                <input v-model="smtpForm.username" class="admin-input" placeholder="your@email.com" />
              </div>

              <div>
                <label class="admin-label">密码</label>
                <input v-model="smtpForm.password" type="password" class="admin-input" placeholder="留空则不更新" />
              </div>

              <div>
                <label class="admin-label">发件人名称</label>
                <input v-model="smtpForm.fromName" class="admin-input" placeholder="AKSRT Blog" />
              </div>

              <div>
                <label class="admin-label">发件人邮箱</label>
                <input v-model="smtpForm.fromEmail" type="email" class="admin-input" placeholder="noreply@example.com" />
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            class="admin-button-secondary"
            :disabled="saving || testingSmtp || !smtpForm.enabled"
            @click="testSmtpSettings"
          >
            {{ testingSmtp ? '测试发送中...' : '测试发送' }}
          </button>
          <button class="admin-button-primary" :disabled="saving || testingSmtp" @click="saveSmtpSettings">
            {{ saving ? '保存中...' : '保存 SMTP 设置' }}
          </button>
        </div>
      </div>

      <!-- 安全设置（极验验证码） -->
      <div v-if="activeTab === 'security'" class="admin-card p-6">
        <h3 class="mb-6 text-lg font-semibold text-slate-900">安全设置 - 极验验证码</h3>

        <div class="space-y-6">
          <div>
            <label class="admin-checkbox-label">
              <input v-model="captchaForm.enabled" type="checkbox" class="admin-checkbox" />
              <span>启用极验验证码</span>
            </label>
          </div>

          <div v-if="captchaForm.enabled">
            <div class="grid gap-6 lg:grid-cols-2">
              <div>
                <label class="admin-label">Captcha ID</label>
                <input v-model="captchaForm.captchaId" class="admin-input" placeholder="your-captcha-id" />
              </div>

              <div>
                <label class="admin-label">Captcha Key</label>
                <input v-model="captchaForm.captchaKey" type="password" class="admin-input" placeholder="留空则不更新" />
              </div>

              <div class="lg:col-span-2">
                <label class="admin-checkbox-label">
                  <input v-model="captchaForm.enabledOnLogin" type="checkbox" class="admin-checkbox" />
                  <span>登录时启用验证码</span>
                </label>
              </div>

              <div class="lg:col-span-2">
                <label class="admin-checkbox-label">
                  <input v-model="captchaForm.enabledOnComment" type="checkbox" class="admin-checkbox" />
                  <span>评论时启用验证码</span>
                </label>
              </div>

              <div class="lg:col-span-2">
                <label class="admin-checkbox-label">
                  <input v-model="captchaForm.enabledOnFriendLink" type="checkbox" class="admin-checkbox" />
                  <span>申请友链时启用验证码</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button class="admin-button-primary" :disabled="saving" @click="saveCaptchaSettings">
            {{ saving ? '保存中...' : '保存安全设置' }}
          </button>
        </div>

        <div class="mt-8 rounded-[4px] border border-dashed border-slate-300 bg-slate-50 p-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h4 class="text-base font-semibold text-slate-900">Comment Captcha Debug</h4>
              <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                This temporary tool opens GeeTest with the saved comment-scene config, then sends the callback payload to an admin dry-run endpoint.
                It validates the same comment captcha path without writing a real comment to the database.
              </p>
            </div>
            <p class="text-xs text-slate-500">
              Saved config only. Save the security settings first after changing captcha ID or key.
            </p>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <label class="block">
              <span class="mb-2 block text-sm font-medium text-slate-700">Article slug</span>
              <input v-model="captchaDebugArticleSlug" class="admin-input" placeholder="1" />
            </label>

            <button
              class="admin-button-secondary"
              :disabled="saving || runningCaptchaDebug"
              @click="startCommentCaptchaDebug"
            >
              {{ runningCaptchaDebug ? 'Running debug...' : 'Run comment captcha debug' }}
            </button>
          </div>

          <div class="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4">
            <div class="rounded-[4px] bg-white px-3 py-2">
              <span class="font-semibold text-slate-700">Captcha enabled:</span>
              {{ captchaConfig?.enabled ? 'yes' : 'no' }}
            </div>
            <div class="rounded-[4px] bg-white px-3 py-2">
              <span class="font-semibold text-slate-700">Comment scene:</span>
              {{ captchaConfig?.enabledOnComment ? 'enabled' : 'disabled' }}
            </div>
            <div class="rounded-[4px] bg-white px-3 py-2">
              <span class="font-semibold text-slate-700">Captcha key:</span>
              {{ captchaConfig?.captchaKeyConfigured ? 'saved' : 'missing' }}
            </div>
            <div class="rounded-[4px] bg-white px-3 py-2">
              <span class="font-semibold text-slate-700">Widget loader:</span>
              {{ captchaDebugLoaded ? 'ready' : 'loading' }}
            </div>
          </div>

          <p
            v-if="captchaDebugMessage"
            class="mt-4 text-sm"
            :class="captchaDebugResult?.commentWouldBeAccepted ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ captchaDebugMessage }}
          </p>

          <div class="mt-4 grid gap-4 xl:grid-cols-2">
            <div>
              <p class="text-sm font-semibold text-slate-800">Client callback payload</p>
              <pre class="mt-2 overflow-x-auto rounded-[4px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ captchaDebugPayload ? JSON.stringify(captchaDebugPayload, null, 2) : 'Run the debug flow to inspect the GeeTest callback payload.' }}</pre>
            </div>

            <div>
              <p class="text-sm font-semibold text-slate-800">Backend dry-run result</p>
              <pre class="mt-2 overflow-x-auto rounded-[4px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">{{ captchaDebugResult ? JSON.stringify(captchaDebugResult, null, 2) : 'No backend dry-run has been executed yet.' }}</pre>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
