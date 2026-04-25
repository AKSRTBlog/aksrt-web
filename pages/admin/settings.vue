<script setup lang="ts">
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha'
import { useAdminSession } from '~/composables/useAdminSession'
import type { AdminCaptchaResult, CommentCaptchaDebugResult } from '~/types/admin'
import type { CommentModerationConfig } from '~/types/admin-settings'

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
const route = useRoute()
const allowedSettingsTabs = new Set([
  'general',
  'customCode',
  'storage',
  'smtp',
  'security',
  'commentModeration',
])

function resolveSettingsTab(tab: unknown) {
  return typeof tab === 'string' && allowedSettingsTabs.has(tab) ? tab : 'general'
}

const activeTab = ref(resolveSettingsTab(route.query.tab))
const captchaDebugArticleSlug = ref('1')
const captchaDebugMessage = ref('')
const captchaDebugResult = ref<CommentCaptchaDebugResult | null>(null)
const captchaDebugPayload = ref<AdminCaptchaResult | null>(null)
const runningCaptchaDebug = ref(false)
const moderationLoading = ref(false)
const moderationSaving = ref(false)
const moderationError = ref('')
const moderationSuccessMessage = ref('')

// AI Connection Test
const testingAi = ref(false)
const aiTestResult = ref<{ success: boolean, message: string, provider?: string, endpoint?: string } | null>(null)

const moderationForm = reactive({
  enabled: true,
  akismetEnabled: false,
  akismetSiteUrl: '',
  akismetBlogLang: 'zh-CN',
  akismetApiKey: '',
  aiEnabled: false,
  aiProvider: 'openai',
  aiModel: 'omni-moderation-latest',
  aiApiKey: '',
  aiBaseUrl: '',              // Custom API base URL
  azureDeploymentId: '',        // Azure deployment ID
  azureApiVersion: '2023-09-01-preview',
  autoApproveLowRisk: true,
  autoRejectHighRisk: true,
  lowRiskMaxScore: 35,
  highRiskMinScore: 80,
  blockedKeywordsText: '',
  rateLimitEnabled: true,
  rateLimitMinIntervalSeconds: 8,
  rateLimitPerArticleWindowMinutes: 10,
  rateLimitPerArticleEmailMax: 3,
  rateLimitPerArticleIpMax: 0,
  rateLimitGlobalWindowMinutes: 60,
  rateLimitGlobalEmailMax: 15,
  rateLimitGlobalIpMax: 60,
  geoipEnabled: true,
  geoipProvider: 'ipapi',
  geoipApiKey: '',
})

// Computed property to show additional fields based on provider
const isAzureProvider = computed(() => ['azure', 'azure_openai', 'azureopenai'].includes(moderationForm.aiProvider.toLowerCase()))
const isCustomProvider = computed(() => ['custom', 'proxy', 'forwarder'].includes(moderationForm.aiProvider.toLowerCase()))

const moderationKeyStatus = reactive({
  akismetApiKeyConfigured: false,
  aiApiKeyConfigured: false,
  geoipApiKeyConfigured: false,
})

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
  { id: 'commentModeration', label: '评论内容审核' },
]

function clearModerationFeedback() {
  moderationError.value = ''
  moderationSuccessMessage.value = ''
}

function parseBlockedKeywords(text: string) {
  return Array.from(
    new Set(
      text
        .split(/[\n,]/g)
        .map(item => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

function normalizeThresholds(low: number, high: number) {
  let normalizedLow = Math.max(0, Math.min(95, Number.isFinite(low) ? low : 35))
  let normalizedHigh = Math.max(5, Math.min(100, Number.isFinite(high) ? high : 80))

  if (normalizedLow >= normalizedHigh) {
    normalizedLow = Math.max(0, normalizedHigh - 5)
  }

  return {
    low: normalizedLow,
    high: normalizedHigh,
  }
}

function normalizeRateLimitValue(value: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback
  }

  return Math.max(min, Math.min(max, Math.trunc(value)))
}

async function loadCommentModerationConfig() {
  moderationLoading.value = true
  clearModerationFeedback()

  try {
    const result = await adminApiFetch<CommentModerationConfig>('/api/v1/admin/site-settings/comment-moderation')
    const keywords = result.blockedKeywords ?? []

    moderationForm.enabled = result.enabled
    moderationForm.akismetEnabled = result.akismetEnabled
    moderationForm.akismetSiteUrl = result.akismetSiteUrl || ''
    moderationForm.akismetBlogLang = result.akismetBlogLang || 'zh-CN'
    moderationForm.akismetApiKey = ''
    moderationForm.aiEnabled = result.aiEnabled
    moderationForm.aiProvider = result.aiProvider || 'openai'
    moderationForm.aiModel = result.aiModel || 'omni-moderation-latest'
    moderationForm.aiApiKey = ''
    moderationForm.aiBaseUrl = result.aiBaseUrl || ''
    moderationForm.azureDeploymentId = result.azureDeploymentId || ''
    moderationForm.azureApiVersion = result.azureApiVersion || '2023-09-01-preview'
    moderationForm.autoApproveLowRisk = result.autoApproveLowRisk
    moderationForm.autoRejectHighRisk = result.autoRejectHighRisk
    moderationForm.lowRiskMaxScore = result.lowRiskMaxScore
    moderationForm.highRiskMinScore = result.highRiskMinScore
    moderationForm.blockedKeywordsText = keywords.join('\n')
    moderationForm.rateLimitEnabled = result.rateLimitEnabled ?? true
    moderationForm.rateLimitMinIntervalSeconds = result.rateLimitMinIntervalSeconds ?? 8
    moderationForm.rateLimitPerArticleWindowMinutes = result.rateLimitPerArticleWindowMinutes ?? 10
    moderationForm.rateLimitPerArticleEmailMax = result.rateLimitPerArticleEmailMax ?? 3
    moderationForm.rateLimitPerArticleIpMax = result.rateLimitPerArticleIpMax ?? 0
    moderationForm.rateLimitGlobalWindowMinutes = result.rateLimitGlobalWindowMinutes ?? 60
    moderationForm.rateLimitGlobalEmailMax = result.rateLimitGlobalEmailMax ?? 15
    moderationForm.rateLimitGlobalIpMax = result.rateLimitGlobalIpMax ?? 60
    moderationForm.geoipEnabled = result.geoipEnabled ?? true
    moderationForm.geoipProvider = result.geoipProvider || 'ipapi'
    moderationForm.geoipApiKey = ''

    moderationKeyStatus.akismetApiKeyConfigured = result.akismetApiKeyConfigured
    moderationKeyStatus.aiApiKeyConfigured = result.aiApiKeyConfigured
    moderationKeyStatus.geoipApiKeyConfigured = result.geoipApiKeyConfigured
  } catch (currentError) {
    moderationError.value = currentError instanceof Error ? currentError.message : '加载评论审核配置失败'
  } finally {
    moderationLoading.value = false
  }
}

async function saveCommentModerationConfig() {
  moderationSaving.value = true
  clearModerationFeedback()

  try {
    const thresholds = normalizeThresholds(moderationForm.lowRiskMaxScore, moderationForm.highRiskMinScore)
    const rateLimit = {
      minIntervalSeconds: normalizeRateLimitValue(moderationForm.rateLimitMinIntervalSeconds, 0, 3600, 8),
      perArticleWindowMinutes: normalizeRateLimitValue(moderationForm.rateLimitPerArticleWindowMinutes, 0, 24 * 60, 10),
      perArticleEmailMax: normalizeRateLimitValue(moderationForm.rateLimitPerArticleEmailMax, 0, 500, 3),
      perArticleIpMax: normalizeRateLimitValue(moderationForm.rateLimitPerArticleIpMax, 0, 1000, 0),
      globalWindowMinutes: normalizeRateLimitValue(moderationForm.rateLimitGlobalWindowMinutes, 0, 24 * 60, 60),
      globalEmailMax: normalizeRateLimitValue(moderationForm.rateLimitGlobalEmailMax, 0, 2000, 15),
      globalIpMax: normalizeRateLimitValue(moderationForm.rateLimitGlobalIpMax, 0, 5000, 60),
    }
    const payload: Record<string, unknown> = {
      enabled: moderationForm.enabled,
      akismetEnabled: moderationForm.akismetEnabled,
      akismetSiteUrl: moderationForm.akismetSiteUrl.trim(),
      akismetBlogLang: moderationForm.akismetBlogLang.trim() || 'zh-CN',
      aiEnabled: moderationForm.aiEnabled,
      aiProvider: moderationForm.aiProvider.trim() || 'openai',
      aiModel: moderationForm.aiModel.trim() || 'omni-moderation-latest',
      aiBaseUrl: moderationForm.aiBaseUrl.trim(),
      azureDeploymentId: moderationForm.azureDeploymentId.trim(),
      azureApiVersion: moderationForm.azureApiVersion.trim() || '2023-09-01-preview',
      autoApproveLowRisk: moderationForm.autoApproveLowRisk,
      autoRejectHighRisk: moderationForm.autoRejectHighRisk,
      lowRiskMaxScore: thresholds.low,
      highRiskMinScore: thresholds.high,
      blockedKeywords: parseBlockedKeywords(moderationForm.blockedKeywordsText),
      rateLimitEnabled: moderationForm.rateLimitEnabled,
      rateLimitMinIntervalSeconds: rateLimit.minIntervalSeconds,
      rateLimitPerArticleWindowMinutes: rateLimit.perArticleWindowMinutes,
      rateLimitPerArticleEmailMax: rateLimit.perArticleEmailMax,
      rateLimitPerArticleIpMax: rateLimit.perArticleIpMax,
      rateLimitGlobalWindowMinutes: rateLimit.globalWindowMinutes,
      rateLimitGlobalEmailMax: rateLimit.globalEmailMax,
      rateLimitGlobalIpMax: rateLimit.globalIpMax,
      geoipEnabled: moderationForm.geoipEnabled,
      geoipProvider: moderationForm.geoipProvider,
    }

    if (moderationForm.akismetApiKey.trim()) {
      payload.akismetApiKey = moderationForm.akismetApiKey.trim()
    }
    if (moderationForm.aiApiKey.trim()) {
      payload.aiApiKey = moderationForm.aiApiKey.trim()
    }
    if (moderationForm.geoipApiKey.trim()) {
      payload.geoipApiKey = moderationForm.geoipApiKey.trim()
    }

    const result = await adminApiFetch<CommentModerationConfig>('/api/v1/admin/site-settings/comment-moderation', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    moderationForm.akismetApiKey = ''
    moderationForm.aiApiKey = ''
    moderationForm.geoipApiKey = ''
    moderationKeyStatus.akismetApiKeyConfigured = result.akismetApiKeyConfigured
    moderationKeyStatus.aiApiKeyConfigured = result.aiApiKeyConfigured
    moderationKeyStatus.geoipApiKeyConfigured = result.geoipApiKeyConfigured
    moderationSuccessMessage.value = '评论审核配置已保存'
  } catch (currentError) {
    moderationError.value = currentError instanceof Error ? currentError.message : '保存评论审核配置失败'
  } finally {
    moderationSaving.value = false
  }
}

// AI Connection Test Function
async function testAiConnection() {
  testingAi.value = true
  aiTestResult.value = null

  try {
    const result = await adminApiFetch<{ success: boolean, message: string, latency?: number, provider?: string, endpoint?: string }>(
      '/api/v1/admin/site-settings/comment-moderation/test-ai',
      {
        method: 'POST',
        body: JSON.stringify({
          provider: moderationForm.aiProvider,
          model: moderationForm.aiModel,
          apiKey: moderationForm.aiApiKey.trim(),
          baseUrl: moderationForm.aiBaseUrl.trim(),
          azureDeploymentId: moderationForm.azureDeploymentId.trim(),
          azureApiVersion: moderationForm.azureApiVersion.trim(),
        }),
      },
    )

    let msg = result.latency
      ? `${result.message} (响应时间: ${result.latency}ms)`
      : result.message

    // Append endpoint info for custom/azure providers
    if (result.endpoint && !result.endpoint.includes('api.openai.com')) {
      msg += `\n端点: ${result.endpoint}`
    }

    aiTestResult.value = {
      success: result.success,
      message: msg,
    }
  } catch (error) {
    aiTestResult.value = {
      success: false,
      message: error instanceof Error ? error.message : 'AI connection test failed.',
    }
  } finally {
    testingAi.value = false
  }
}

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
  await Promise.all([
    loadSettings(),
    loadCommentModerationConfig(),
  ])
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

      <div v-if="activeTab === 'commentModeration'" class="space-y-6">
        <section class="admin-card p-6">
          <h3 class="text-lg font-semibold text-slate-900">总开关</h3>
          <label class="mt-5 inline-flex items-center gap-3 text-sm text-slate-700">
            <input v-model="moderationForm.enabled" type="checkbox" class="admin-checkbox">
            启用评论审核管道
          </label>
          <p class="mt-3 text-xs leading-6 text-slate-500">
            开启后：评论提交会进入审核管道（反垃圾 + AI + 风险分级），再决定自动通过、人工审核或拒绝。
          </p>
        </section>

        <div v-if="moderationError" class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {{ moderationError }}
        </div>
        <div v-if="moderationSuccessMessage" class="admin-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {{ moderationSuccessMessage }}
        </div>

        <div v-if="moderationLoading" class="admin-card px-5 py-10 text-center text-sm text-slate-500">
          正在加载评论审核配置...
        </div>

        <template v-else>
          <section class="admin-card p-6">
            <h3 class="text-lg font-semibold text-slate-900">Akismet 反垃圾</h3>
            <div class="mt-5 grid gap-5 md:grid-cols-2">
              <label class="md:col-span-2 inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.akismetEnabled" type="checkbox" class="admin-checkbox">
                启用 Akismet 检测
              </label>

              <div>
                <p class="admin-label">Site URL</p>
                <input v-model="moderationForm.akismetSiteUrl" class="admin-input" placeholder="https://example.com">
              </div>

              <div>
                <p class="admin-label">Blog Language</p>
                <input v-model="moderationForm.akismetBlogLang" class="admin-input" placeholder="zh-CN">
              </div>

              <div class="md:col-span-2">
                <p class="admin-label">Akismet API Key</p>
                <input v-model="moderationForm.akismetApiKey" type="password" class="admin-input" placeholder="留空则保持当前密钥不变">
                <p class="mt-2 text-xs text-slate-500">当前状态：{{ moderationKeyStatus.akismetApiKeyConfigured ? '已配置' : '未配置' }}</p>
              </div>
            </div>
          </section>


          <section class="admin-card p-6">
            <h3 class="text-lg font-semibold text-slate-900">AI 内容审核</h3>
            <p class="mt-2 text-sm leading-6 text-slate-500">
              使用 AI Moderations API 进行智能内容检测。支持多提供商配置，包括 OpenAI 官方、Azure OpenAI 和自定义代理。
            </p>

            <!-- Privacy Warning -->
            <div class="mt-3 rounded-[4px] border border-amber-300 bg-amber-50 p-3">
              <p class="text-sm font-medium text-amber-800">⚠️ 隐私提醒</p>
              <p class="mt-1 text-xs leading-6 text-amber-700">
                启用 AI 审核后，评论内容（含昵称、邮箱、网站）将被发送至第三方 API 进行处理。
                请确保您已配置隐私协议，或在网站隐私政策中告知用户相关内容。
                若使用自定义端点，数据将发送至您配置的地址。
              </p>
            </div>

            <!-- AI Connection Test Result -->
            <div v-if="aiTestResult" class="mt-4 rounded-[4px] p-3" :class="aiTestResult.success ? 'bg-emerald-50 border border-emerald-200' : 'bg-rose-50 border border-rose-200'">
              <p class="text-sm font-medium" :class="aiTestResult.success ? 'text-emerald-800' : 'text-rose-800'">
                {{ aiTestResult.success ? '✓ 连接成功' : '✗ 连接失败' }}
              </p>
              <pre v-if="aiTestResult.message" class="mt-1 text-xs whitespace-pre-wrap break-words" :class="aiTestResult.success ? 'text-emerald-600' : 'text-rose-600'">
                {{ aiTestResult.message }}
              </pre>
            </div>

            <div class="mt-5 space-y-5">
              <!-- Provider Selection -->
              <label class="inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.aiEnabled" type="checkbox" class="admin-checkbox">
                启用 AI 审核
              </label>

              <!-- Provider Type -->
              <div>
                <p class="admin-label">Provider 类型</p>
                <select v-model="moderationForm.aiProvider" class="admin-select">
                  <option value="openai">🌐 OpenAI (官方)</option>
                  <option value="azure">☁️ Azure OpenAI</option>
                  <option value="custom">🔧 自定义端点 / 代理</option>
                </select>

                <!-- Provider-specific hints -->
                <p class="mt-1.5 text-xs text-slate-500">
                  {{ moderationForm.aiProvider === 'openai' ? '直接连接到 OpenAI 官方 API，推荐使用 omni-moderation-latest 模型' : '' }}
                  {{ moderationForm.aiProvider === 'azure' ? '使用 Microsoft Azure OpenAI 服务，需要填写资源名称和部署 ID' : '' }}
                  {{ moderationForm.aiProvider === 'custom' ? '适用于自建代理、国内转发服务或其他 OpenAI 兼容接口' : '' }}
                </p>
              </div>

              <!-- Model Selection -->
              <div>
                <p class="admin-label">模型选择</p>
                <select v-model="moderationForm.aiModel" class="admin-select">
                  <optgroup label="推荐模型">
                    <option value="omni-moderation-latest">Omni Moderation (最新版) ✓ 推荐</option>
                    <option value="text-moderation-latest">Text Moderation (最新版)</option>
                  </optgroup>
                  <optgroup label="稳定版本">
                    <option value="text-moderation-stable">Text Moderation (稳定版)</option>
                  </optgroup>
                  <optgroup label="历史版本">
                    <option value="text-moderation-001">Text Moderation v001</option>
                  </optgroup>
                </select>
                <p class="mt-1.5 text-xs text-slate-500">
                  不同模型对中文内容的支持程度不同
                </p>
              </div>

              <!-- Azure Specific Fields -->
              <template v-if="isAzureProvider">
                <div class="grid gap-5 md:grid-cols-2">
                  <div>
                    <p class="admin-label">资源名称 (Resource Name)</p>
                    <input
                      v-model="moderationForm.aiBaseUrl"
                      class="admin-input"
                      placeholder="your-resource.openai.azure.com"
                    >
                    <p class="mt-1.5 text-xs text-slate-500">
                      Azure OpenAI 的资源端点域名
                    </p>
                  </div>
                  <div>
                    <p class="admin-label">部署 ID (Deployment ID)</p>
                    <input
                      v-model="moderationForm.azureDeploymentId"
                      class="admin-input"
                      placeholder="如: omni-moderation-deployment"
                    >
                    <p class="mt-1.5 text-xs text-slate-500">
                      在 Azure 上创建的部署实例 ID
                    </p>
                  </div>
                </div>
                <div>
                  <p class="admin-label">API Version</p>
                  <input
                    v-model="moderationForm.azureApiVersion"
                    class="admin-input"
                    placeholder="2023-09-01-preview"
                  >
                  <p class="mt-1.5 text-xs text-slate-500">
                    默认: 2023-09-01-preview
                  </p>
                </div>
              </template>

              <!-- Custom Provider Fields -->
              <template v-if="isCustomProvider">
                <div>
                  <p class="admin-label">自定义 Base URL</p>
                  <input
                        v-model="moderationForm.aiBaseUrl"
                        class="admin-input"
                        placeholder="https://api.your-proxy.com 或 https://api.openai.com"
                  >
                  <p class="mt-1.5 text-xs text-slate-500">
                    填写完整的 API 基础地址 (不含 /v1/moderations)
                  </p>
                  <div class="mt-2 rounded-[4px] bg-amber-50 border border-amber-200 p-3">
                    <p class="text-xs text-amber-700">
                      💡 示例：<br>
                      • 国内转发: https://api.openai-forwarder.com<br>
                      • 自建代理: https://your-domain.com/api<br>
                      • 兼容格式: 必须兼容 OpenAI Moderations API 格式
                    </p>
                    <p class="mt-2 text-xs font-medium text-amber-800">⚠️ 隐私提醒</p>
                    <p class="text-xs text-amber-700">
                      使用自定义端点时，评论数据（含昵称、邮箱）将发送至您配置的地址。请确保该端点可信。
                    </p>
                  </div>
                </div>
              </template>

              <!-- API Key -->
              <div>
                <p class="admin-label">API Key</p>
                <div class="flex gap-3">
                  <input
                    v-model="moderationForm.aiApiKey"
                    type="password"
                    class="admin-input flex-1"
                    :placeholder="isAzureProvider ? 'Azure 的密钥' : 'sk-...'"
                  >
                  <button
                    type="button"
                    class="admin-button-secondary whitespace-nowrap"
                    :disabled="testingAi || !moderationForm.aiApiKey"
                    @click="testAiConnection"
                  >
                    {{ testingAi ? '测试中...' : '测试连接' }}
                  </button>
                </div>
                <p class="mt-2 text-xs text-slate-500">
                  当前状态：
                  <span class="font-medium" :class="moderationKeyStatus.aiApiKeyConfigured ? 'text-emerald-600' : 'text-amber-600'">
                    {{ moderationKeyStatus.aiApiKeyConfigured ? '✓ 已配置' : '○ 未配置' }}
                  </span>
                  · 填写后点击"测试连接"验证有效性
                </p>
              </div>

              <!-- Configuration Summary Panel -->
              <div class="rounded-[4px] bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 border border-blue-200/60 p-4">
                <h4 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  📋 当前配置摘要
                </h4>
                <div class="grid gap-3 text-xs md:grid-cols-2">
                  <div class="rounded-lg bg-white/70 p-2.5">
                    <span class="block text-slate-500 mb-1">Provider</span>
                    <span class="font-semibold text-slate-800 capitalize">{{ moderationForm.aiProvider }}</span>
                  </div>
                  <div class="rounded-lg bg-white/70 p-2.5">
                    <span class="block text-slate-500 mb-1">Model</span>
                    <span class="font-semibold text-slate-800 truncate block">{{ moderationForm.aiModel }}</span>
                  </div>
                  <div class="rounded-lg bg-white/70 p-2.5">
                    <span class="block text-slate-500 mb-1">端点</span>
                    <span class="font-semibold text-slate-800 truncate block">{{ isCustomProvider ? (moderationForm.aiBaseUrl || '未设置') : (isAzureProvider ? (moderationForm.aiBaseUrl || '未设置') : 'api.openai.com') }}</span>
                  </div>
                  <div v-if="isAzureProvider" class="rounded-lg bg-white/70 p-2.5">
                    <span class="block text-slate-500 mb-1">部署 ID</span>
                    <span class="font-semibold text-slate-800 truncate block">{{ moderationForm.azureDeploymentId || '未设置' }}</span>
                  </div>
                </div>

                <!-- AI Scoring Info -->
                <details class="mt-3 rounded-[4px] bg-white/80">
                  <summary class="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-blue-700 hover:text-blue-900 transition-colors">
                    🔍 AI 评分机制详情 (点击展开)
                  </summary>
                  <div class="px-3 pb-3 text-xs leading-relaxed text-blue-600">
                    <ul class="space-y-1.5 mt-2 list-disc pl-5">
                      <li>采用<strong>加权评分算法</strong>：不同违规类型具有不同权重系数（如：性暴力 1.8x、仇恨言论 1.4x、垃圾信息 0.9x）</li>
                      <li><strong>10级精细评分</strong>：0/10/22/38/50/62/75/85/95，替代原来的5级粗粒度评分</li>
                      <li><strong>中文内容预处理</strong>：自动转换数字、规范化文本，提升AI对中文理解准确度</li>
                      <li><strong>优雅降级策略</strong>：API调用失败时不影响正常评论流程</li>
                      <li><strong>详细分类展示</strong>：前端可查看每个类别的得分、权重和触发状态</li>
                      <li><strong>多端点支持</strong>：OpenAI/Azure/自定义代理，满足各种网络环境需求</li>
                    </ul>
                  </div>
                </details>
              </div>
            </div>
          </section>

          <section class="admin-card p-6">
            <h3 class="text-lg font-semibold text-slate-900">风险分级与自动决策</h3>
            <div class="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <p class="admin-label">低风险最大分值</p>
                <input v-model.number="moderationForm.lowRiskMaxScore" type="number" min="0" max="95" class="admin-input">
              </div>

              <div>
                <p class="admin-label">高风险最小分值</p>
                <input v-model.number="moderationForm.highRiskMinScore" type="number" min="5" max="100" class="admin-input">
              </div>

              <label class="inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.autoApproveLowRisk" type="checkbox" class="admin-checkbox">
                低风险自动放行
              </label>

              <label class="inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.autoRejectHighRisk" type="checkbox" class="admin-checkbox">
                高风险自动拒绝
              </label>

              <div class="md:col-span-2">
                <p class="admin-label">敏感词（每行一个，或用英文逗号分隔）</p>
                <textarea
                  v-model="moderationForm.blockedKeywordsText"
                  class="admin-textarea min-h-36"
                  placeholder="spam keyword&#10;fake casino&#10;恶意引流"
                />
              </div>
            </div>
          </section>

          <section class="admin-card p-6">
            <h3 class="text-lg font-semibold text-slate-900">GeoIP</h3>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              保存评论时将 IP 解析为国家名称。公开评论只显示国家，不显示原始 IP。
            </p>
            <div class="mt-5 grid gap-5 md:grid-cols-2">
              <label class="md:col-span-2 inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.geoipEnabled" type="checkbox" class="admin-checkbox">
                启用 IP 国家解析
              </label>

              <div>
                <p class="admin-label">解析来源</p>
                <select v-model="moderationForm.geoipProvider" class="admin-select">
                  <option value="ipapi">ipapi.co</option>
                  <option value="ipinfo">ipinfo.io</option>
                  <option value="ipgeolocation">ipgeolocation.io</option>
                </select>
              </div>

              <div>
                <p class="admin-label">API Token</p>
                <input v-model="moderationForm.geoipApiKey" type="password" class="admin-input" placeholder="留空则保持当前 Token 不变">
                <p class="mt-2 text-xs text-slate-500">当前状态：{{ moderationKeyStatus.geoipApiKeyConfigured ? '已配置' : '未配置' }}</p>
              </div>
            </div>
          </section>

          <section class="admin-card p-6">
            <h3 class="text-lg font-semibold text-slate-900">评论频率限制</h3>
            <p class="mt-2 text-xs leading-6 text-slate-500">
              0 表示禁用该条规则。建议优先按邮箱限流，IP 限流用于兜底并适当放宽。
            </p>
            <div class="mt-5 grid gap-5 md:grid-cols-2">
              <label class="md:col-span-2 inline-flex items-center gap-3 text-sm text-slate-700">
                <input v-model="moderationForm.rateLimitEnabled" type="checkbox" class="admin-checkbox">
                启用评论频率限制
              </label>

              <div>
                <p class="admin-label">短冷却（秒）</p>
                <input v-model.number="moderationForm.rateLimitMinIntervalSeconds" type="number" min="0" max="3600" class="admin-input">
              </div>

              <div>
                <p class="admin-label">每篇窗口（分钟）</p>
                <input v-model.number="moderationForm.rateLimitPerArticleWindowMinutes" type="number" min="0" max="1440" class="admin-input">
              </div>

              <div>
                <p class="admin-label">每篇每邮箱上限</p>
                <input v-model.number="moderationForm.rateLimitPerArticleEmailMax" type="number" min="0" max="500" class="admin-input">
              </div>

              <div>
                <p class="admin-label">每篇每 IP 上限</p>
                <input v-model.number="moderationForm.rateLimitPerArticleIpMax" type="number" min="0" max="1000" class="admin-input">
              </div>

              <div>
                <p class="admin-label">全局窗口（分钟）</p>
                <input v-model.number="moderationForm.rateLimitGlobalWindowMinutes" type="number" min="0" max="1440" class="admin-input">
              </div>

              <div>
                <p class="admin-label">全局每邮箱上限</p>
                <input v-model.number="moderationForm.rateLimitGlobalEmailMax" type="number" min="0" max="2000" class="admin-input">
              </div>

              <div class="md:col-span-2">
                <p class="admin-label">全局每 IP 上限</p>
                <input v-model.number="moderationForm.rateLimitGlobalIpMax" type="number" min="0" max="5000" class="admin-input">
              </div>
            </div>
          </section>

          <div class="flex justify-end">
            <button class="admin-button-primary" :disabled="moderationSaving" @click="saveCommentModerationConfig">
              {{ moderationSaving ? '保存中...' : '保存评论审核配置' }}
            </button>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>
