// 站点设置相关类型
export interface SeoMeta {
  title: string
  description: string
  keywords: string
  canonicalUrl: string
}

export interface NavigationItem {
  id: string
  label: string
  href: string
  iconUrl?: string | null
  sortOrder: number
  enabled: boolean
}

export interface FooterLinkItem {
  id: string
  label: string
  href: string
  iconUrl: string | null
  description: string
  sortOrder: number
  enabled: boolean
}

export interface AboutContactItem {
  id: string
  name: string
  displayText: string
  url: string
}

export interface PublicSiteSettings {
  siteTitle: string
  siteDescription: string
  logoUrl: string | null
  commentEnabled: boolean
  seo: SeoMeta
  navigationItems: NavigationItem[]
  footerLinks: FooterLinkItem[]
  customHeadCode: string | null
  customFooterCode: string | null
  icpFiling: string | null
  policeFiling: string | null
  showFiling: boolean
  githubUsername: string | null
  aboutDisplayName: string | null
  aboutBio: string | null
  aboutContacts: AboutContactItem[]
  adminAvatarUrl: string | null
}

export interface StorageConfig {
  id: string
  enabled: boolean
  driver: 'local' | 's3-compatible' | 'aliyun-oss' | 'tencent-cos'
  endpoint: string | null
  region: string | null
  bucket: string | null
  accessKeyId: string
  secretAccessKeyConfigured: boolean
  publicBaseUrl: string
  baseFolder: string
  forcePathStyle: boolean
  createdAt: string
  updatedAt: string
}

export interface SmtpConfig {
  id: string
  enabled: boolean
  host: string
  port: number
  secure: boolean
  username: string
  passwordConfigured: boolean
  fromName: string
  fromEmail: string
  createdAt: string
  updatedAt: string
  lastTestAt: string | null
  lastTestStatus: 'untested' | 'success' | 'failed'
  lastErrorMessage: string | null
}

export interface CaptchaConfig {
  id: string
  enabled: boolean
  captchaId: string
  captchaKeyConfigured: boolean
  enabledOnComment: boolean
  enabledOnFriendLink: boolean
  enabledOnLogin: boolean
}

export interface CommentModerationConfig {
  id: string
  enabled: boolean
  akismetEnabled: boolean
  akismetApiKeyConfigured: boolean
  akismetSiteUrl: string
  akismetBlogLang: string
  aiEnabled: boolean
  aiProvider: string
  aiApiKeyConfigured: boolean
  aiModel: string
  aiBaseUrl: string           // Custom API base URL
  azureDeploymentId: string   // Azure deployment ID
  azureApiVersion: string    // Azure API version
  autoApproveLowRisk: boolean
  autoRejectHighRisk: boolean
  lowRiskMaxScore: number
  highRiskMinScore: number
  blockedKeywords: string[]
  rateLimitEnabled: boolean
  rateLimitMinIntervalSeconds: number
  rateLimitPerArticleWindowMinutes: number
  rateLimitPerArticleEmailMax: number
  rateLimitPerArticleIpMax: number
  rateLimitGlobalWindowMinutes: number
  rateLimitGlobalEmailMax: number
  rateLimitGlobalIpMax: number
  geoipEnabled: boolean
  geoipProvider: string
  geoipApiKeyConfigured: boolean
}

export interface AdminSiteSettings {
  publicConfig: PublicSiteSettings
  smtpConfig: SmtpConfig
  storageConfig: StorageConfig
}
