import { getHeader } from 'h3';
import { fetchAllPublicArticles, fetchPublicCategories, fetchPublicSiteSettings, fetchPublicStandalonePages } from '~/composables/api';

/**
 * Sitemap XML 生成
 * 遵循 Sitemap 0.9 协议：https://www.sitemaps.org/protocol.html
 *
 * 优化点：
 * 1. 支持 gzip 压缩（Google 推荐，减小 70%+ 体积）
 * 2. 标签页 / 分类页也带 lastmod（取最新文章更新时间）
 * 3. 所有 URL 去重、按优先级排序
 * 4. 支持 sitemap index（当 URL > 50000 时自动拆分）
 * 5. lastmod 格式统一为 YYYY-MM-DD（Google 推荐）
 * 6. escapeXml 修复 & 替换顺序（必须先替换 &）
 * 7. getHeader 正确引入（从 h3 导入）
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')   // ⚠️ 必须先替换 &
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** 取 YYYY-MM-DD，Google 推荐此格式 */
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  // 兼容 "YYYY-MM-DDTHH:MM:SSZ" 和 "YYYY-MM-DD"
  return (iso || '').slice(0, 10);
}

export default defineEventHandler(async (event) => {
  const [settings, articles, categories, pages] = await Promise.all([
    fetchPublicSiteSettings(),
    fetchAllPublicArticles(),
    fetchPublicCategories(),
    fetchPublicStandalonePages(),
  ]);

  const baseUrl = (settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl || '').replace(/\/+$/, '');
  if (!baseUrl) {
    return new Response('<!-- sitemap disabled: canonical URL not configured -->', {
      headers: { 'content-type': 'text/xml; charset=utf-8' },
    });
  }

  // ── 计算分类 / 标签的最新更新时间 ──────────────────────
  const latestByCategory = new Map<string, string>();
  const latestByTag     = new Map<string, string>();

  for (const a of articles) {
    if (a.status !== 'published') continue;
    const ts = a.updatedAt || a.publishedAt || '';
    if (!ts) continue;
    if (a.categorySlug) {
      const prev = latestByCategory.get(a.categorySlug) || '';
      if (ts > prev) latestByCategory.set(a.categorySlug, ts);
    }
    for (const t of a.tags || []) {
      const prev = latestByTag.get(t.slug) || '';
      if (ts > prev) latestByTag.set(t.slug, ts);
    }
  }

  // ── 收集所有 URL（去重）─────────────────────────────────
  const urlMap = new Map<string, { loc: string; lastmod: string; changefreq: string; priority: string }>();

  function addUrl(loc: string, lastmod: string | null | undefined, changefreq: string, priority: string) {
    const key = loc;
    if (urlMap.has(key)) {
      const existing = urlMap.get(key)!;
      if (parseFloat(priority) > parseFloat(existing.priority)) {
        urlMap.set(key, { loc, lastmod: lastmod || existing.lastmod, changefreq, priority });
      }
      return;
    }
    urlMap.set(key, { loc, lastmod: lastmod || '', changefreq, priority });
  }

  // 固定页面
  addUrl(`${baseUrl}/`,        undefined,  'daily',   '1.0');
  addUrl(`${baseUrl}/articles`,   undefined,  'daily',   '0.9');
  addUrl(`${baseUrl}/archive`,  undefined,  'weekly',  '0.7');
  addUrl(`${baseUrl}/about`,    undefined,  'monthly', '0.7');
  addUrl(`${baseUrl}/links`,   undefined,  'weekly',  '0.7');

  // 分类页（带 lastmod）
  for (const cat of categories) {
    if (!cat.isEnabled) continue;
    addUrl(
      `${baseUrl}/categories/${cat.slug}`,
      latestByCategory.get(cat.slug),
      'weekly',
      '0.6',
    );
  }

  // 标签页（带 lastmod）
  for (const [slug, ts] of latestByTag) {
    addUrl(
      `${baseUrl}/tags/${slug}`,
      ts,
      'weekly',
      '0.5',
    );
  }

  // 独立页面
  for (const page of pages) {
    if (!page.isEnabled) continue;
    addUrl(
      `${baseUrl}/pages/${page.slug}`,
      page.updatedAt || page.publishedAt,
      'monthly',
      '0.6',
    );
  }

  // 文章页
  for (const article of articles) {
    if (article.status !== 'published') continue;
    addUrl(
      `${baseUrl}/articles/${article.slug}`,
      article.updatedAt || article.publishedAt,
      'weekly',
      '0.8',
    );
  }

  // ── 如果 URL 太多，生成 sitemap index ─────────────────────
  const urlList = [...urlMap.values()];
  const MAX = 50000; // Sitemap 协议上限

  if (urlList.length > MAX) {
    const chunks: typeof urlList[] = [];
    for (let i = 0; i < urlList.length; i += MAX) {
      chunks.push(urlList.slice(i, i + MAX));
    }

    const indexBody = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${chunks.map((_, i) => `  <sitemap>
    <loc>${escapeXml(`${baseUrl}/sitemaps/${i + 1}.xml`)}</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`;

    return new Response(indexBody, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'max-age=3600',
      },
    });
  }

  // ── 生成标准 sitemap.xml ────────────────────────────────
  const urlEntries = urlList
    .sort((a, b) => parseFloat(b.priority) - parseFloat(a.priority))
    .map(entry => buildUrlEntry(entry))
    .join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;

  // 支持 gzip（客户端 / Google 若带 Accept-Encoding: gzip 则返回压缩版本）
  const acceptEncoding = getHeader(event, 'accept-encoding') || '';
  if (acceptEncoding.includes('gzip')) {
    const zlib = await import('zlib');
    const compressed = zlib.gzipSync(Buffer.from(body, 'utf-8'));
    return new Response(compressed, {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'content-encoding': 'gzip',
        'cache-control': 'max-age=3600',
      },
    });
  }

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'max-age=3600',
    },
  });
});

/** 构建单个 <url> 条目 */
function buildUrlEntry(entry: { loc: string; lastmod: string; changefreq: string; priority: string }): string {
  const escapedLoc = escapeXml(entry.loc);
  const lastmodXml = entry.lastmod ? `  <lastmod>${formatDate(entry.lastmod)}</lastmod>` : '';
  return `  <url>
    <loc>${escapedLoc}</loc>
${lastmodXml}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}
