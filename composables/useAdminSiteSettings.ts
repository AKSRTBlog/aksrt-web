import type {
  AdminSiteSettings,
  CaptchaConfig,
  PublicSiteSettings,
  SmtpConfig,
  StorageConfig,
} from '~/types/admin-settings'

export function useAdminSiteSettings() {
  const { adminApiFetch } = useAdminSession()
  const { invalidatePublicData } = usePublicDataInvalidation()

  const loading = ref(false)
  const saving = ref(false)
  const testingSmtp = ref(false)
  const error = ref('')
  const successMessage = ref('')

  const settings = ref<AdminSiteSettings | null>(null)
  const captchaConfig = ref<CaptchaConfig | null>(null)

  const publicForm = ref({
    siteTitle: '',
    siteDescription: '',
    logoUrl: '',
    commentEnabled: true,
    seoKeywords: '',
    icpFiling: '',
    policeFiling: '',
    showFiling: false,
    githubUsername: '',
    aboutDisplayName: '',
    aboutBio: '',
  })

  const customCodeForm = ref({
    customHeadCode: '',
    customFooterCode: '',
  })

  const storageForm = ref({
    enabled: true,
    driver: 'local' as 'local' | 's3-compatible' | 'aliyun-oss' | 'tencent-cos',
    endpoint: '',
    region: '',
    bucket: '',
    accessKeyId: '',
    secretAccessKey: '',
    publicBaseUrl: '',
    baseFolder: 'blog',
    forcePathStyle: false,
  })

  const smtpForm = ref({
    enabled: false,
    host: '',
    port: '587',
    secure: false,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
  })

  const captchaForm = ref({
    enabled: false,
    captchaId: '',
    captchaKey: '',
    enabledOnComment: true,
    enabledOnFriendLink: true,
    enabledOnLogin: true,
  })

  function clearFeedback() {
    error.value = ''
    successMessage.value = ''
  }

  function syncSmtpForm(smtp: SmtpConfig) {
    smtpForm.value = {
      enabled: smtp.enabled,
      host: smtp.host,
      port: String(smtp.port),
      secure: smtp.secure,
      username: smtp.username,
      password: '',
      fromName: smtp.fromName,
      fromEmail: smtp.fromEmail,
    }
  }

  function buildSmtpPayload() {
    const body: Record<string, unknown> = {
      enabled: smtpForm.value.enabled,
      host: smtpForm.value.host.trim(),
      port: parseInt(smtpForm.value.port, 10),
      secure: smtpForm.value.secure,
      username: smtpForm.value.username.trim(),
      fromName: smtpForm.value.fromName.trim(),
      fromEmail: smtpForm.value.fromEmail.trim(),
    }

    if (smtpForm.value.password.trim()) {
      body.password = smtpForm.value.password.trim()
    }

    return body
  }

  async function persistSmtpConfig() {
    const result = await adminApiFetch<SmtpConfig>('/api/v1/admin/smtp/config', {
      method: 'PUT',
      body: JSON.stringify(buildSmtpPayload()),
    })

    if (settings.value) {
      settings.value.smtpConfig = result
    }

    syncSmtpForm(result)
    return result
  }

  async function loadSettings() {
    loading.value = true
    error.value = ''

    try {
      const [siteResult, captchaResult] = await Promise.all([
        adminApiFetch<AdminSiteSettings>('/api/v1/admin/site-settings'),
        adminApiFetch<CaptchaConfig>('/api/v1/admin/site-settings/captcha'),
      ])

      settings.value = siteResult
      captchaConfig.value = captchaResult

      const pub = siteResult.publicConfig
      publicForm.value = {
        siteTitle: pub.siteTitle,
        siteDescription: pub.siteDescription,
        logoUrl: pub.logoUrl ?? '',
        commentEnabled: pub.commentEnabled,
        seoKeywords: pub.seo.keywords,
        icpFiling: pub.icpFiling ?? '',
        policeFiling: pub.policeFiling ?? '',
        showFiling: pub.showFiling,
        githubUsername: pub.githubUsername ?? '',
        aboutDisplayName: pub.aboutDisplayName ?? '',
        aboutBio: pub.aboutBio ?? '',
      }

      customCodeForm.value = {
        customHeadCode: pub.customHeadCode ?? '',
        customFooterCode: pub.customFooterCode ?? '',
      }

      const sto = siteResult.storageConfig
      storageForm.value = {
        enabled: sto.enabled,
        driver: sto.driver,
        endpoint: sto.endpoint ?? '',
        region: sto.region ?? '',
        bucket: sto.bucket ?? '',
        accessKeyId: sto.accessKeyId,
        secretAccessKey: '',
        publicBaseUrl: sto.publicBaseUrl,
        baseFolder: sto.baseFolder,
        forcePathStyle: sto.forcePathStyle,
      }

      syncSmtpForm(siteResult.smtpConfig)

      captchaForm.value = {
        enabled: captchaResult.enabled,
        captchaId: captchaResult.captchaId,
        captchaKey: '',
        enabledOnComment: captchaResult.enabledOnComment,
        enabledOnFriendLink: captchaResult.enabledOnFriendLink,
        enabledOnLogin: captchaResult.enabledOnLogin,
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载设置失败'
    } finally {
      loading.value = false
    }
  }

  async function savePublicSettings() {
    saving.value = true
    clearFeedback()

    try {
      const result = await adminApiFetch<PublicSiteSettings>('/api/v1/admin/site-settings/public', {
        method: 'PUT',
        body: JSON.stringify({
          siteTitle: publicForm.value.siteTitle.trim(),
          siteDescription: publicForm.value.siteDescription.trim(),
          logoUrl: publicForm.value.logoUrl.trim() || null,
          commentEnabled: publicForm.value.commentEnabled,
          seoKeywords: publicForm.value.seoKeywords.trim(),
          icpFiling: publicForm.value.icpFiling.trim() || null,
          policeFiling: publicForm.value.policeFiling.trim() || null,
          showFiling: publicForm.value.showFiling,
          githubUsername: publicForm.value.githubUsername.trim() || null,
          aboutDisplayName: publicForm.value.aboutDisplayName.trim() || null,
          aboutBio: publicForm.value.aboutBio.trim() || null,
        }),
      })

      if (settings.value) {
        settings.value.publicConfig = result
      }

      invalidatePublicData()
      successMessage.value = '设置已保存'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
    } finally {
      saving.value = false
    }
  }

  async function saveCustomCode() {
    saving.value = true
    clearFeedback()

    try {
      const result = await adminApiFetch<PublicSiteSettings>('/api/v1/admin/site-settings/public', {
        method: 'PUT',
        body: JSON.stringify({
          customHeadCode: customCodeForm.value.customHeadCode,
          customFooterCode: customCodeForm.value.customFooterCode,
        }),
      })

      if (settings.value) {
        settings.value.publicConfig = result
      }

      invalidatePublicData()
      successMessage.value = '自定义代码已保存'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
    } finally {
      saving.value = false
    }
  }

  async function saveStorageSettings() {
    saving.value = true
    clearFeedback()

    try {
      const body: Record<string, unknown> = {
        enabled: storageForm.value.enabled,
        driver: storageForm.value.driver,
        endpoint: storageForm.value.endpoint.trim() || null,
        region: storageForm.value.region.trim() || null,
        bucket: storageForm.value.bucket.trim() || null,
        accessKeyId: storageForm.value.accessKeyId.trim(),
        publicBaseUrl: storageForm.value.publicBaseUrl.trim(),
        baseFolder: storageForm.value.baseFolder.trim() || 'blog',
        forcePathStyle: storageForm.value.forcePathStyle,
      }

      if (storageForm.value.secretAccessKey.trim()) {
        body.secretAccessKey = storageForm.value.secretAccessKey.trim()
      }

      const result = await adminApiFetch<StorageConfig>('/api/v1/admin/site-settings/storage', {
        method: 'PUT',
        body: JSON.stringify(body),
      })

      if (settings.value) {
        settings.value.storageConfig = result
      }

      successMessage.value = '存储设置已保存'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
    } finally {
      saving.value = false
    }
  }

  async function saveSmtpSettings() {
    saving.value = true
    clearFeedback()

    try {
      await persistSmtpConfig()
      successMessage.value = 'SMTP 设置已保存'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
    } finally {
      saving.value = false
    }
  }

  async function testSmtpSettings() {
    if (!smtpForm.value.enabled) {
      error.value = '请先启用 SMTP'
      successMessage.value = ''
      return
    }

    testingSmtp.value = true
    clearFeedback()

    try {
      const savedConfig = await persistSmtpConfig()

      await adminApiFetch('/api/v1/admin/smtp/test', {
        method: 'POST',
        body: JSON.stringify({
          toEmail: savedConfig.fromEmail,
        }),
      })

      successMessage.value = `测试邮件已发送至 ${savedConfig.fromEmail}`
    } catch (e) {
      error.value = e instanceof Error ? e.message : '测试发送失败'
    } finally {
      testingSmtp.value = false
    }
  }

  async function saveCaptchaSettings() {
    saving.value = true
    clearFeedback()

    try {
      const body: Record<string, unknown> = {
        enabled: captchaForm.value.enabled,
        captchaId: captchaForm.value.captchaId.trim(),
        enabledOnComment: captchaForm.value.enabledOnComment,
        enabledOnFriendLink: captchaForm.value.enabledOnFriendLink,
        enabledOnLogin: captchaForm.value.enabledOnLogin,
      }

      if (captchaForm.value.captchaKey.trim()) {
        body.captchaKey = captchaForm.value.captchaKey.trim()
      }

      const result = await adminApiFetch<CaptchaConfig>('/api/v1/admin/site-settings/captcha', {
        method: 'PUT',
        body: JSON.stringify(body),
      })

      captchaConfig.value = result
      captchaForm.value = {
        enabled: result.enabled,
        captchaId: result.captchaId,
        captchaKey: '',
        enabledOnComment: result.enabledOnComment,
        enabledOnFriendLink: result.enabledOnFriendLink,
        enabledOnLogin: result.enabledOnLogin,
      }

      invalidatePublicData({ keys: ['site-settings'] })
      successMessage.value = '验证码设置已保存'
    } catch (e) {
      error.value = e instanceof Error ? e.message : '保存失败'
    } finally {
      saving.value = false
    }
  }

  return {
    loading,
    saving,
    testingSmtp,
    error,
    successMessage,
    settings,
    captchaConfig,
    publicForm,
    customCodeForm,
    storageForm,
    smtpForm,
    captchaForm,
    loadSettings,
    savePublicSettings,
    saveCustomCode,
    saveStorageSettings,
    saveSmtpSettings,
    testSmtpSettings,
    saveCaptchaSettings,
  }
}
