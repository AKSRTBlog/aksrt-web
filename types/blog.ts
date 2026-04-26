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

export interface PublicNavigationItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string | null;
  sortOrder: number;
  enabled: boolean;
}

export interface PublicFooterLinkItem {
  id: string;
  label: string;
  href: string;
  iconUrl: string | null;
  description: string;
  sortOrder: number;
  enabled: boolean;
}

export interface AboutContactItem {
  id: string;
  name: string;
  displayText: string;
  url: string;
}

export interface PublicStandalonePageSummaryItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  sortOrder: number;
}

export interface PublicStandalonePageDetailItem extends PublicStandalonePageSummaryItem {
  content: string;
  containsCommentLockedContent: boolean;
}

export interface PublicSiteSettingsItem {
  siteTitle: string;
  siteDescription: string;
  logoUrl: string | null;
  commentEnabled: boolean;
  seo: {
    title: string;
    description: string;
    keywords: string;
    canonicalUrl: string;
  };
  navigationItems: PublicNavigationItem[];
  footerLinks: PublicFooterLinkItem[];
  customHeadCode: string | null;
  customFooterCode: string | null;
  icpFiling: string | null;
  policeFiling: string | null;
  showFiling: boolean;
  githubUsername: string | null;
  aboutDisplayName: string | null;
  aboutBio: string | null;
  aboutContacts: AboutContactItem[];
  adminAvatarUrl: string | null;
}

export interface PublicArticleCategoryItem {
  id: string;
  name: string;
  slug: string;
}

export interface PublicArticleTagItem {
  id: string;
  name: string;
  slug: string;
}

export interface PublicArticleSummaryItem {
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
  categories: PublicArticleCategoryItem[];
  tags: PublicArticleTagItem[];
}

export interface PublicArticleDetailItem extends PublicArticleSummaryItem {
  content: string;
  publicContent: string;
  hiddenContent: string | null;
  requiresCommentUnlock: boolean;
  isUnlocked: boolean;
  createdBy: string;
  updatedBy: string;
}

export interface BlogArticleSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  allowComment: boolean;
  categories: PublicArticleCategoryItem[];
  tags: PublicArticleTagItem[];
}

export interface BlogArticleDetail extends BlogArticleSummary {
  content: string;
  publicContent: string;
  hiddenContent: string | null;
  requiresCommentUnlock: boolean;
  isUnlocked: boolean;
  readingTime: number;
}

export interface PublicCommentSubmissionResult {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  unlockToken: string | null;
  unlockTokenExpiresAt: string | null;
  postId: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogComment {
  id: string;
  parentId: string | null;
  nickname: string;
  avatarUrl: string;
  content: string;
  ip: string | null;
  countryName: string | null;
  userAgent: string | null;
  browserLabel: string | null;
  osLabel: string | null;
  createdAt: string;
  replies: BlogComment[];
}

export interface PublicCommentItem {
  id: string;
  parentId: string | null;
  nickname: string;
  avatarUrl: string;
  content: string;
  ip: string | null;
  countryName: string | null;
  userAgent: string | null;
  browserLabel: string | null;
  osLabel: string | null;
  createdAt: string;
  replies: PublicCommentItem[];
}

export interface PublicBannerItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  linkUrl: string;
  linkTarget: '_self' | '_blank';
  position: 'home_top' | 'home_sidebar' | 'article_sidebar' | 'footer';
  sortOrder: number;
  status: 'enabled' | 'disabled';
  showText: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicProjectItem {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  link: string;
  sortOrder: number;
  enabled: boolean;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionData {
  weeks: ContributionWeek[];
  totalContributions: number;
}

export interface ArchiveMonthGroup {
  month: string;
  monthKey: string;
  items: BlogArticleSummary[];
}

export interface ArchiveYearGroup {
  year: string;
  total: number;
  months: ArchiveMonthGroup[];
}

export interface PublicCaptchaConfig {
  enabled: boolean;
  provider: 'geetest';
  captchaId: string;
  enabledOnComment: boolean;
  enabledOnFriendLink: boolean;
  enabledOnLogin: boolean;
}

export interface PublicSyncVersionItem {
  version: string;
}
