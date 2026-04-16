const adminPaths = {
  login: "/admin/login",
  dashboard: "/admin",
  articles: "/admin/articles",
  articleCreate: "/admin/articles/new",
  articleEdit: (id) => `/admin/articles/${id}`,
  comments: "/admin/comments",
  standalonePages: "/admin/pages",
  friendLinks: "/admin/friend-links",
  contentManagement: "/admin/content",
  banners: "/admin/banners",
  media: "/admin/media",
  projects: "/admin/projects",
  settings: "/admin/settings",
  adminManagement: "/admin/administrators"
};
const adminNavSections = [
  {
    title: "内容管理",
    items: [
      { to: adminPaths.dashboard, label: "控制台", icon: "dashboard", exact: true },
      { to: adminPaths.articles, label: "文章管理", icon: "articles" },
      { to: adminPaths.comments, label: "评论管理", icon: "comments" },
      { to: adminPaths.standalonePages, label: "独立页面", icon: "pages" },
      { to: adminPaths.friendLinks, label: "友情链接", icon: "friend-links" },
      { to: adminPaths.contentManagement, label: "分类标签", icon: "content" }
    ]
  },
  {
    title: "资源配置",
    items: [
      { to: adminPaths.banners, label: "Banner 管理", icon: "banners" },
      { to: adminPaths.media, label: "媒体资源", icon: "media" },
      { to: adminPaths.projects, label: "项目管理", icon: "projects" },
      { to: adminPaths.settings, label: "站点设置", icon: "settings" }
    ]
  },
  {
    title: "系统管理",
    items: [{ to: adminPaths.adminManagement, label: "管理员", icon: "admins" }]
  }
];
const fallbackAdminAvatar = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22 viewBox=%220 0 80 80%22%3E%3Crect width=%2280%22 height=%2280%22 rx=%2240%22 fill=%22%231e293b%22/%3E%3Ctext x=%2250%25%22 y=%2252%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23ffffff%22 font-family=%22sans-serif%22 font-size=%2230%22%3EAK%3C/text%3E%3C/svg%3E";
function normalizeAdminEmail(email) {
  return email.trim().toLowerCase();
}
function md5cycle(state, block) {
  let [a, b, c, d] = state;
  const ff = (a2, b2, c2, d2, x, s, t) => cmn(b2 & c2 | ~b2 & d2, a2, b2, x, s, t);
  const gg = (a2, b2, c2, d2, x, s, t) => cmn(b2 & d2 | c2 & ~d2, a2, b2, x, s, t);
  const hh = (a2, b2, c2, d2, x, s, t) => cmn(b2 ^ c2 ^ d2, a2, b2, x, s, t);
  const ii = (a2, b2, c2, d2, x, s, t) => cmn(c2 ^ (b2 | ~d2), a2, b2, x, s, t);
  a = ff(a, b, c, d, block[0], 7, -680876936);
  d = ff(d, a, b, c, block[1], 12, -389564586);
  c = ff(c, d, a, b, block[2], 17, 606105819);
  b = ff(b, c, d, a, block[3], 22, -1044525330);
  a = ff(a, b, c, d, block[4], 7, -176418897);
  d = ff(d, a, b, c, block[5], 12, 1200080426);
  c = ff(c, d, a, b, block[6], 17, -1473231341);
  b = ff(b, c, d, a, block[7], 22, -45705983);
  a = ff(a, b, c, d, block[8], 7, 1770035416);
  d = ff(d, a, b, c, block[9], 12, -1958414417);
  c = ff(c, d, a, b, block[10], 17, -42063);
  b = ff(b, c, d, a, block[11], 22, -1990404162);
  a = ff(a, b, c, d, block[12], 7, 1804603682);
  d = ff(d, a, b, c, block[13], 12, -40341101);
  c = ff(c, d, a, b, block[14], 17, -1502002290);
  b = ff(b, c, d, a, block[15], 22, 1236535329);
  a = gg(a, b, c, d, block[1], 5, -165796510);
  d = gg(d, a, b, c, block[6], 9, -1069501632);
  c = gg(c, d, a, b, block[11], 14, 643717713);
  b = gg(b, c, d, a, block[0], 20, -373897302);
  a = gg(a, b, c, d, block[5], 5, -701558691);
  d = gg(d, a, b, c, block[10], 9, 38016083);
  c = gg(c, d, a, b, block[15], 14, -660478335);
  b = gg(b, c, d, a, block[4], 20, -405537848);
  a = gg(a, b, c, d, block[9], 5, 568446438);
  d = gg(d, a, b, c, block[14], 9, -1019803690);
  c = gg(c, d, a, b, block[3], 14, -187363961);
  b = gg(b, c, d, a, block[8], 20, 1163531501);
  a = gg(a, b, c, d, block[13], 5, -1444681467);
  d = gg(d, a, b, c, block[2], 9, -51403784);
  c = gg(c, d, a, b, block[7], 14, 1735328473);
  b = gg(b, c, d, a, block[12], 20, -1926607734);
  a = hh(a, b, c, d, block[5], 4, -378558);
  d = hh(d, a, b, c, block[8], 11, -2022574463);
  c = hh(c, d, a, b, block[11], 16, 1839030562);
  b = hh(b, c, d, a, block[14], 23, -35309556);
  a = hh(a, b, c, d, block[1], 4, -1530992060);
  d = hh(d, a, b, c, block[4], 11, 1272893353);
  c = hh(c, d, a, b, block[7], 16, -155497632);
  b = hh(b, c, d, a, block[10], 23, -1094730640);
  a = hh(a, b, c, d, block[13], 4, 681279174);
  d = hh(d, a, b, c, block[0], 11, -358537222);
  c = hh(c, d, a, b, block[3], 16, -722521979);
  b = hh(b, c, d, a, block[6], 23, 76029189);
  a = hh(a, b, c, d, block[9], 4, -640364487);
  d = hh(d, a, b, c, block[12], 11, -421815835);
  c = hh(c, d, a, b, block[15], 16, 530742520);
  b = hh(b, c, d, a, block[2], 23, -995338651);
  a = ii(a, b, c, d, block[0], 6, -198630844);
  d = ii(d, a, b, c, block[7], 10, 1126891415);
  c = ii(c, d, a, b, block[14], 15, -1416354905);
  b = ii(b, c, d, a, block[5], 21, -57434055);
  a = ii(a, b, c, d, block[12], 6, 1700485571);
  d = ii(d, a, b, c, block[3], 10, -1894986606);
  c = ii(c, d, a, b, block[10], 15, -1051523);
  b = ii(b, c, d, a, block[1], 21, -2054922799);
  a = ii(a, b, c, d, block[8], 6, 1873313359);
  d = ii(d, a, b, c, block[15], 10, -30611744);
  c = ii(c, d, a, b, block[6], 15, -1560198380);
  b = ii(b, c, d, a, block[13], 21, 1309151649);
  a = ii(a, b, c, d, block[4], 6, -145523070);
  d = ii(d, a, b, c, block[11], 10, -1120210379);
  c = ii(c, d, a, b, block[2], 15, 718787259);
  b = ii(b, c, d, a, block[9], 21, -343485551);
  state[0] = add32(a, state[0]);
  state[1] = add32(b, state[1]);
  state[2] = add32(c, state[2]);
  state[3] = add32(d, state[3]);
}
function cmn(q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t));
  return add32(a << s | a >>> 32 - s, b);
}
function md5blk(input) {
  const blocks = new Array(16);
  for (let i = 0; i < 64; i += 4) {
    blocks[i >> 2] = input.charCodeAt(i) + (input.charCodeAt(i + 1) << 8) + (input.charCodeAt(i + 2) << 16) + (input.charCodeAt(i + 3) << 24);
  }
  return blocks;
}
function md51(input) {
  const length = input.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let index = 64;
  for (; index <= length; index += 64) {
    md5cycle(state, md5blk(input.slice(index - 64, index)));
  }
  const tail = new Array(16).fill(0);
  const remainder = input.slice(index - 64);
  for (let i = 0; i < remainder.length; i += 1) {
    tail[i >> 2] |= remainder.charCodeAt(i) << (i % 4 << 3);
  }
  tail[remainder.length >> 2] |= 128 << (remainder.length % 4 << 3);
  if (remainder.length > 55) {
    md5cycle(state, tail);
    tail.fill(0);
  }
  tail[14] = length * 8;
  md5cycle(state, tail);
  return state;
}
function rhex(value) {
  const hex = "0123456789abcdef";
  let output = "";
  for (let index = 0; index < 4; index += 1) {
    output += hex[value >> index * 8 + 4 & 15] + hex[value >> index * 8 & 15];
  }
  return output;
}
function add32(a, b) {
  return a + b & 4294967295;
}
function md5Hex(input) {
  return md51(input).map(rhex).join("");
}
function buildAdminCravatarUrl(email, size = 160) {
  const normalizedEmail = normalizeAdminEmail(email);
  if (!normalizedEmail) {
    return fallbackAdminAvatar;
  }
  return `https://cn.cravatar.com/avatar/${md5Hex(normalizedEmail)}?s=${size}&d=identicon`;
}
function isAdminNavItemActive(pathname, item) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to);
}
function getAdminRouteTitle(pathname) {
  const item = adminNavSections.flatMap((section) => section.items).find((entry) => isAdminNavItemActive(pathname, entry));
  return item?.label ?? "管理后台";
}
function formatAdminNumber(value) {
  if (value >= 1e4) {
    return `${(value / 1e4).toFixed(1)}w`;
  }
  if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}k`;
  }
  return `${value}`;
}
function formatAdminDate(value) {
  return new Date(value).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
export {
  adminPaths as a,
  formatAdminDate as b,
  buildAdminCravatarUrl as c,
  fallbackAdminAvatar as d,
  adminNavSections as e,
  formatAdminNumber as f,
  getAdminRouteTitle as g,
  isAdminNavItemActive as i
};
//# sourceMappingURL=admin-BhXx1q9A.js.map
