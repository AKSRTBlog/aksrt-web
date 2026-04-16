import { fetchPublicSiteSettings } from '~/composables/api';

export default defineEventHandler(async () => {
  const settings = await fetchPublicSiteSettings();
  const baseUrl = settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl;

  return new Response(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

Disallow: /admin/
Disallow: /api/v1/admin/`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
    },
  });
});
