import { deriveTags, fetchAllPublicArticles, fetchPublicCategories, fetchPublicSiteSettings, fetchPublicStandalonePages } from '~/composables/api';

/**
 * Sitemap XML 生成
 * 遵循 Sitemap 0.9 协议：https://www.sitemaps.org/protocol.html
 * Google 支持 lastmod / changefreq / priority 字段
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(iso: string | undefined): string {
  if (!iso) return '';
  // 取 YYYY-MM-DD 格式（Google 接受完整 ISO 8601）
  return iso.split('T')[0] || '';
}

export default defineEventHandler(async () => {
  const [settings, articles, categories, tags, pages] = await Promise.all([
    fetchPublicSiteSettings(),
    fetchAllPublicArticles(),
    fetchPublicCategories(),
    // deriveTags 从 articles 提取
    Promise.resolve(true).then(() => fetchAllPublicArticles()),
    fetchPublicStandalonePages(),
  ]);

  const baseUrl = (settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl || '').replace(/\/+$/, '');
  if (!baseUrl) {
    return new Response('<!-- sitemap disabled: canonical URL not configured -->', {
      headers: { 'content-type': 'text/xml; charset=utf-8' },
    });
  }

  // 第二次提取 tags（从 articles）
  const allArticles = articles; // 第一次结果
  const allArticles2 = await fetchAllPublicArticles();
  const tagSlugs = new Set<string>();
  for (const a of allArticles2) {
    for (const t of a.tags || []) {
      tagSlugs.add(t.slug);
    }
  }

  const urls: string[] = [];

  // 固定页面
  const staticPages = [
    { loc: `${baseUrl}/`,        priority: '1.0', changefreq: 'daily'  },
    { loc: `${baseUrl}/articles`, priority: '0.9', changefreq: 'daily'  },
    { loc: `${baseUrl}/archive`,  priority: '0.7', changefreq: 'weekly' },
    { loc: `${baseUrl}/about`,    priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/links`,   priority: '0.7', changefreq: 'weekly' },
  ];
  for (const p of staticPages) {
    urls.push(buildUrlEntry(p.loc, undefined, p.changefreq, p.priority));
  }

  // 分类页
  for (const cat of categories) {
    if (!cat.isEnabled) continue;
    urls.push(buildUrlEntry(
      `${baseUrl}/categories/${cat.slug}`,
      undefined,
      'weekly',
      '0.6',
    ));
  }

  // 标签页
  for (const slug of tagSlugs) {
    urls.push(buildUrlEntry(
      `${baseUrl}/tags/${slug}`,
      undefined,
      'weekly',
      '0.5',
    ));
  }

  // 独立页面
  for (const page of pages) {
    if (!page.isEnabled) continue;
    urls.push(buildUrlEntry(
      `${baseUrl}/pages/${page.slug}`,
      page.updatedAt || page.publishedAt,
      'monthly',
      '0.6',
    ));
  }

  // 文章页
  for (const article of allArticles) {
    if (article.status !== 'published') continue;
    urls.push(buildUrlEntry(
      `${baseUrl}/articles/${article.slug}`,
      article.updatedAt || article.publishedAt,
      'weekly',
      '0.8',
    ));
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.join('\n')}
</urlset>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'max-age=3600',
    },
  });
});

function buildUrlEntry(
  loc: string,
  lastmod: string | undefined,
  changefreq: string,
  priority: string,
): string {
  const escapedLoc = escapeXml(loc);
  const lastmodXml = lastmod ? `  <lastmod>${formatDate(lastmod)}</lastmod>` : '';
  return `  <url>
    <loc>${escapedLoc}</loc>
${lastmodXml}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
