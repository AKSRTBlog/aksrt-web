import { fetchPublicSiteSettings } from '~/composables/api';
import { normalizeBaseUrl } from '../utils/sitemap';

const TEXT_HEADERS = {
  'content-type': 'text/plain; charset=utf-8',
  'cache-control': 'max-age=3600',
};

const DISALLOW_RULES = [
  '/admin/',
  '/api/v1/admin/',
  '/api/v1/public/sync-version',
];

function renderRobots(baseUrl: string): string {
  const lines = [
    'User-agent: *',
    ...DISALLOW_RULES.map((path) => `Disallow: ${path}`),
  ];

  if (baseUrl) {
    lines.push('', `Sitemap: ${baseUrl}/sitemap.xml`);
  }

  return `${lines.join('\n')}\n`;
}

export default defineEventHandler(async () => {
  const runtimeSiteUrl = useRuntimeConfig().public.siteUrl;
  const settings = await fetchPublicSiteSettings().catch(() => null);
  const baseUrl = normalizeBaseUrl(settings?.seo?.canonicalUrl) || normalizeBaseUrl(runtimeSiteUrl);

  return new Response(renderRobots(baseUrl), {
    headers: TEXT_HEADERS,
  });
});
