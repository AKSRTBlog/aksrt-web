import { fetchPublicSiteSettings } from '~/composables/api';

export default defineEventHandler(async () => {
  const settings = await fetchPublicSiteSettings();
  const baseUrl = settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl;

  // 确保 baseUrl 不以 / 结尾，sitemap 路径前加 /
  const sitemapUrl = `${baseUrl.replace(/\/+$/, '')}/sitemap.xml`;
  return new Response(`User-agent: *
Allow: /

Sitemap: ${sitemapUrl}

Disallow: /admin/
Disallow: /api/v1/admin/`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
});
