export interface ApiEnvelope<T> {
  code: string;
  message: string;
  data: T;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminApiProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  avatarUrl: string | null;
  status: 'active' | 'disabled';
  lastLoginAt: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  admin: AdminApiProfile;
}

export interface AdminSessionData extends AuthResponse {
  remember: boolean;
}

export interface ArticleCategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface ArticleSummaryItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  status: 'draft' | 'published';
  allowComment: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories: ArticleCategoryItem[];
  tags: ArticleTagItem[];
}

export interface ArticleDetailItem extends ArticleSummaryItem {
  content: string;
  createdBy: string;
  updatedBy: string;
}

export interface ArticleEditorOptions {
  categories: ArticleCategoryItem[];
  tags: ArticleTagItem[];
}

export interface AdminCommentItem {
  id: string;
  article: {
    id: string;
    title: string;
    slug: string;
  };
  parent: {
    id: string;
    nickname: string;
    status: 'pending' | 'approved' | 'rejected';
  } | null;
  nickname: string;
  email: string;
  website: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  ip: string | null;
  userAgent: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectReason: string | null;
  moderationRiskLevel: 'low' | 'medium' | 'high' | null;
  moderationRiskScore: number | null;
  moderationSummary: string | null;
  moderationAkismetRaw: string | null;
  moderationAiRaw: string | null;
  moderationPipelineVersion: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MediaUsage = 'article_cover' | 'article_content' | 'banner' | 'site_asset' | 'misc';

export interface MediaAssetItem {
  id: string;
  provider: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  url: string;
  usage: MediaUsage;
  status: 'active' | 'deleted';
  title: string;
  altText: string | null;
  caption: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMediaAssetInput {
  title?: string;
  altText?: string | null;
  caption?: string | null;
  description?: string | null;
}

export interface AdminCaptchaResult {
  lot_number: string;
  captcha_output: string;
  pass_token: string;
  gen_time: string;
}

// 内容管理类型
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  iconUrl?: string | null;
  sortOrder: number;
  enabled: boolean;
}

export interface AdminCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTagItem {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description: string;
  isEnabled: boolean;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  isEnabled?: boolean;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

export interface UpdateTagInput {
  name?: string;
  slug?: string;
}

export interface UpdateNavigationItemInput {
  id?: string;
  label: string;
  href: string;
  iconUrl?: string | null;
  sortOrder: number;
  enabled: boolean;
}

export interface FooterLinkItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string | null;
  description: string;
  sortOrder: number;
  enabled: boolean;
}

export interface UpdateFooterLinkInput {
  id?: string;
  label: string;
  href: string;
  iconUrl?: string | null;
  description?: string;
  sortOrder: number;
  enabled: boolean;
}

export interface AdminFriendLinkApplicationItem {
  id: string;
  siteName: string;
  siteUrl: string;
  iconUrl: string | null;
  description: string;
  contactName: string;
  contactEmail: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  linkedFooterLinkId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BannerPosition = 'home_top' | 'home_sidebar' | 'article_sidebar' | 'footer';
export type BannerStatus = 'enabled' | 'disabled';

export interface BannerItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string;
  linkTarget: '_self' | '_blank';
  position: BannerPosition;
  sortOrder: number;
  status: BannerStatus;
  showText: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CommentCaptchaDebugResult {
  scene: string;
  dryRun: boolean;
  provider: string;
  articleSlug: string;
  articleTitle: string | null;
  articleFound: boolean;
  articlePublished: boolean;
  articleAllowComment: boolean;
  siteCommentEnabled: boolean;
  captchaEnabled: boolean;
  captchaIdConfigured: boolean;
  captchaKeyConfigured: boolean;
  enabledOnComment: boolean;
  captchaRequired: boolean;
  validationAttempted: boolean;
  validationPassed: boolean;
  commentWouldBeAccepted: boolean;
  code: string;
  message: string;
  payload: {
    lotNumberPreview: string;
    captchaOutputPreview: string;
    passTokenPreview: string;
    genTime: string;
  } | null;
}
