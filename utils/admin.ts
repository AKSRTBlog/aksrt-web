export const adminPaths = {
  login: '/admin/login',
  dashboard: '/admin',
  articles: '/admin/articles',
  articleCreate: '/admin/articles/new',
  articleEdit: (id: string) => `/admin/articles/${id}`,
  comments: '/admin/comments',
  standalonePages: '/admin/pages',
  friendLinks: '/admin/friend-links',
  contentManagement: '/admin/content',
  banners: '/admin/banners',
  media: '/admin/media',
  projects: '/admin/projects',
  settings: '/admin/settings',
  adminManagement: '/admin/administrators',
}

export type AdminNavIconName =
  | 'dashboard'
  | 'articles'
  | 'comments'
  | 'pages'
  | 'friend-links'
  | 'content'
  | 'banners'
  | 'media'
  | 'projects'
  | 'settings'
  | 'admins'

export interface AdminNavItem {
  to: string
  label: string
  icon: AdminNavIconName
  exact?: boolean
}

export interface AdminNavSection {
  title: string
  items: AdminNavItem[]
}

export const adminNavSections: AdminNavSection[] = [
  {
    title: '内容管理',
    items: [
      { to: adminPaths.dashboard, label: '控制台', icon: 'dashboard', exact: true },
      { to: adminPaths.articles, label: '文章管理', icon: 'articles' },
      { to: adminPaths.comments, label: '评论管理', icon: 'comments' },
      { to: adminPaths.standalonePages, label: '独立页面', icon: 'pages' },
      { to: adminPaths.friendLinks, label: '友情链接', icon: 'friend-links' },
      { to: adminPaths.contentManagement, label: '分类标签', icon: 'content' },
    ],
  },
  {
    title: '资源配置',
    items: [
      { to: adminPaths.banners, label: 'Banner 管理', icon: 'banners' },
      { to: adminPaths.media, label: '媒体资源', icon: 'media' },
      { to: adminPaths.projects, label: '项目管理', icon: 'projects' },
      { to: adminPaths.settings, label: '站点设置', icon: 'settings' },
    ],
  },
  {
    title: '系统管理',
    items: [{ to: adminPaths.adminManagement, label: '管理员', icon: 'admins' }],
  },
]

// ... (中间省略了未变动的 MD5 和工具函数代码，保持原样即可) ...

export function add32(a: number, b: number) {
  return (a + b) & 0xffffffff
}

export function md5Hex(input: string) {
  return md51(input).map(rhex).join('')
}

export function buildAdminCravatarUrl(email: string, size = 160) {
  const normalizedEmail = normalizeAdminEmail(email)

  if (!normalizedEmail) {
    return fallbackAdminAvatar
  }

  return `https://cn.cravatar.com/avatar/${md5Hex(normalizedEmail)}?s=${size}&d=identicon`
}

export function isAdminNavItemActive(pathname: string, item: AdminNavItem) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to)
}

export function getAdminRouteTitle(pathname: string) {
  const item = adminNavSections
    .flatMap(section => section.items)
    .find(entry => isAdminNavItemActive(pathname, entry))

  return item?.label ?? '管理后台'
}

export function formatAdminNumber(value: number) {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`
  }

  return `${value}`
}

export function formatAdminDate(value: string) {
  return new Date(value).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export type AdminStatusTone = 'default' | 'success' | 'warning' | 'danger'


export const adminText = {
  articleDraft: '草稿',
  articlePublished: '已发布',
  articleScheduled: '定时发布',
  reviewPending: '待审核',
  reviewApproved: '审核通过',
  reviewRejected: '审核拒绝',
  statusEnabled: '已启用',
  statusDisabled: '已禁用',
  unpublished: '未发布',
  unselected: '未选择',
  uncategorized: '未分类',
  notSet: '未设置',
  noCover: '无封面',
  noLink: '无链接',
  allStatuses: '所有状态',
  allCategories: '所有分类',
  noArticles: '暂无文章',
  noComments: '暂无评论',
} as const

export function getAdminArticleStatusLabel(status: 'draft' | 'published' | 'scheduled') {
  if (status === 'published') {
    return adminText.articlePublished
  }

  if (status === 'scheduled') {
    return adminText.articleScheduled
  }

  return adminText.articleDraft
}

export function getAdminArticleStatusTone(status: 'draft' | 'published' | 'scheduled'): AdminStatusTone {
  if (status === 'published') {
    return 'success'
  }

  return 'warning'
}

export function getAdminReviewStatusLabel(status: 'pending' | 'approved' | 'rejected') {
  if (status === 'approved') {
    return adminText.reviewApproved
  }

  if (status === 'rejected') {
    return adminText.reviewRejected
  }

  return adminText.reviewPending
}

export function getAdminReviewStatusTone(status: 'pending' | 'approved' | 'rejected'): AdminStatusTone {
  if (status === 'approved') {
    return 'success'
  }

  if (status === 'rejected') {
    return 'danger'
  }

  return 'warning'
}

export function getAdminBannerStatusLabel(status: 'enabled' | 'disabled') {
  return status === 'enabled' ? adminText.statusEnabled : adminText.statusDisabled
}

export function getAdminBannerStatusTone(status: 'enabled' | 'disabled'): AdminStatusTone {
  return status === 'enabled' ? 'success' : 'default'
}