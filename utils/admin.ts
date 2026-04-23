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

export const fallbackAdminAvatar = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><rect width="160" height="160" rx="32" fill="#2563eb"/><circle cx="80" cy="60" r="28" fill="#bfdbfe"/><path d="M34 132c9-24 27-36 46-36s37 12 46 36" fill="#dbeafe"/></svg>',
)}`

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase()
}

function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
  a = add32(add32(a, q), add32(x, t))
  return add32((a << s) | (a >>> (32 - s)), b)
}

function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & c) | (~b & d), a, b, x, s, t)
}

function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn((b & d) | (c & ~d), a, b, x, s, t)
}

function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(b ^ c ^ d, a, b, x, s, t)
}

function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
  return cmn(c ^ (b | ~d), a, b, x, s, t)
}

function md5cycle(state: [number, number, number, number], block: number[]) {
  let [a, b, c, d] = state

  a = ff(a, b, c, d, block[0]!, 7, -680876936)
  d = ff(d, a, b, c, block[1]!, 12, -389564586)
  c = ff(c, d, a, b, block[2]!, 17, 606105819)
  b = ff(b, c, d, a, block[3]!, 22, -1044525330)
  a = ff(a, b, c, d, block[4]!, 7, -176418897)
  d = ff(d, a, b, c, block[5]!, 12, 1200080426)
  c = ff(c, d, a, b, block[6]!, 17, -1473231341)
  b = ff(b, c, d, a, block[7]!, 22, -45705983)
  a = ff(a, b, c, d, block[8]!, 7, 1770035416)
  d = ff(d, a, b, c, block[9]!, 12, -1958414417)
  c = ff(c, d, a, b, block[10]!, 17, -42063)
  b = ff(b, c, d, a, block[11]!, 22, -1990404162)
  a = ff(a, b, c, d, block[12]!, 7, 1804603682)
  d = ff(d, a, b, c, block[13]!, 12, -40341101)
  c = ff(c, d, a, b, block[14]!, 17, -1502002290)
  b = ff(b, c, d, a, block[15]!, 22, 1236535329)

  a = gg(a, b, c, d, block[1]!, 5, -165796510)
  d = gg(d, a, b, c, block[6]!, 9, -1069501632)
  c = gg(c, d, a, b, block[11]!, 14, 643717713)
  b = gg(b, c, d, a, block[0]!, 20, -373897302)
  a = gg(a, b, c, d, block[5]!, 5, -701558691)
  d = gg(d, a, b, c, block[10]!, 9, 38016083)
  c = gg(c, d, a, b, block[15]!, 14, -660478335)
  b = gg(b, c, d, a, block[4]!, 20, -405537848)
  a = gg(a, b, c, d, block[9]!, 5, 568446438)
  d = gg(d, a, b, c, block[14]!, 9, -1019803690)
  c = gg(c, d, a, b, block[3]!, 14, -187363961)
  b = gg(b, c, d, a, block[8]!, 20, 1163531501)
  a = gg(a, b, c, d, block[13]!, 5, -1444681467)
  d = gg(d, a, b, c, block[2]!, 9, -51403784)
  c = gg(c, d, a, b, block[7]!, 14, 1735328473)
  b = gg(b, c, d, a, block[12]!, 20, -1926607734)

  a = hh(a, b, c, d, block[5]!, 4, -378558)
  d = hh(d, a, b, c, block[8]!, 11, -2022574463)
  c = hh(c, d, a, b, block[11]!, 16, 1839030562)
  b = hh(b, c, d, a, block[14]!, 23, -35309556)
  a = hh(a, b, c, d, block[1]!, 4, -1530992060)
  d = hh(d, a, b, c, block[4]!, 11, 1272893353)
  c = hh(c, d, a, b, block[7]!, 16, -155497632)
  b = hh(b, c, d, a, block[10]!, 23, -1094730640)
  a = hh(a, b, c, d, block[13]!, 4, 681279174)
  d = hh(d, a, b, c, block[0]!, 11, -358537222)
  c = hh(c, d, a, b, block[3]!, 16, -722521979)
  b = hh(b, c, d, a, block[6]!, 23, 76029189)
  a = hh(a, b, c, d, block[9]!, 4, -640364487)
  d = hh(d, a, b, c, block[12]!, 11, -421815835)
  c = hh(c, d, a, b, block[15]!, 16, 530742520)
  b = hh(b, c, d, a, block[2]!, 23, -995338651)

  a = ii(a, b, c, d, block[0]!, 6, -198630844)
  d = ii(d, a, b, c, block[7]!, 10, 1126891415)
  c = ii(c, d, a, b, block[14]!, 15, -1416354905)
  b = ii(b, c, d, a, block[5]!, 21, -57434055)
  a = ii(a, b, c, d, block[12]!, 6, 1700485571)
  d = ii(d, a, b, c, block[3]!, 10, -1894986606)
  c = ii(c, d, a, b, block[10]!, 15, -1051523)
  b = ii(b, c, d, a, block[1]!, 21, -2054922799)
  a = ii(a, b, c, d, block[8]!, 6, 1873313359)
  d = ii(d, a, b, c, block[15]!, 10, -30611744)
  c = ii(c, d, a, b, block[6]!, 15, -1560198380)
  b = ii(b, c, d, a, block[13]!, 21, 1309151649)
  a = ii(a, b, c, d, block[4]!, 6, -145523070)
  d = ii(d, a, b, c, block[11]!, 10, -1120210379)
  c = ii(c, d, a, b, block[2]!, 15, 718787259)
  b = ii(b, c, d, a, block[9]!, 21, -343485551)

  state[0] = add32(a, state[0])
  state[1] = add32(b, state[1])
  state[2] = add32(c, state[2])
  state[3] = add32(d, state[3])
}

function md5blk(input: string) {
  const blocks = new Array<number>(16)

  for (let index = 0; index < 64; index += 4) {
    blocks[index >> 2] =
      input.charCodeAt(index)
      + (input.charCodeAt(index + 1) << 8)
      + (input.charCodeAt(index + 2) << 16)
      + (input.charCodeAt(index + 3) << 24)
  }

  return blocks
}

function md51(input: string) {
  const state: [number, number, number, number] = [1732584193, -271733879, -1732584194, 271733878]

  let index: number
  for (index = 64; index <= input.length; index += 64) {
    md5cycle(state, md5blk(input.substring(index - 64, index)))
  }

  const tail = new Array<number>(16).fill(0)
  const remaining = input.substring(index - 64)

  for (let offset = 0; offset < remaining.length; offset += 1) {
    tail[offset >> 2] |= remaining.charCodeAt(offset) << ((offset % 4) << 3)
  }

  tail[remaining.length >> 2] |= 0x80 << ((remaining.length % 4) << 3)

  if (remaining.length > 55) {
    md5cycle(state, tail)
    tail.fill(0)
  }

  tail[14] = input.length * 8
  md5cycle(state, tail)

  return state
}

const hexChars = '0123456789abcdef'.split('')

function rhex(value: number) {
  let output = ''

  for (let index = 0; index < 4; index += 1) {
    output += hexChars[(value >> (index * 8 + 4)) & 0x0f]
    output += hexChars[(value >> (index * 8)) & 0x0f]
  }

  return output
}

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
  reviewApproved: '已通过',
  reviewRejected: '已驳回',
  statusEnabled: '已启用',
  statusDisabled: '已禁用',
  unpublished: '未发布',
  unselected: '未选择',
  uncategorized: '未分类',
  notSet: '未设置',
  noCover: '无封面',
  noLink: '无链接',
  allStatuses: '全部状态',
  allCategories: '全部分类',
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
