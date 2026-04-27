import { fetchPublicSiteSettings } from '~/composables/api';

/**
 * robots.txt 优化：
 * - 移除多余的 Allow: /（默认就是允许，不需要写）
 * - Sitemap 指向正确的 URL
 * - 禁止后台和 API 被索引
 */
export default defineEventHandler(async () => {
  const settings = await fetchPublicSiteSettings();
  const baseUrl = (settings.seo?.canonicalUrl || useRuntimeConfig().public.siteUrl || '').replace(/\/+$/, '');

  if (!baseUrl) {
    // 未配置 canonical URL，返回最基础规则
    return new Response(`User-agent: *
Disallow: /admin/
Disallow: /api/v1/admin/`, {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  const sitemapUrl = `${baseUrl}/sitemap.xml`;

  return new Response(`User-agent: *
Disallow: /admin/
Disallow: /api/v1/admin/

Sitemap: ${sitemapUrl}`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
});
