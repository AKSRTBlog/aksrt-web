import { c as defineEventHandler, u as useRuntimeConfig } from '../_/nitro.mjs';
import { f as fetchPublicSiteSettings } from '../_/api.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'marked';

const robots_txt = defineEventHandler(async () => {
  const settings = await fetchPublicSiteSettings();
  const baseUrl = settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl;
  return new Response(`User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

Disallow: /admin/
Disallow: /api/v1/admin/`, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
});

export { robots_txt as default };
//# sourceMappingURL=robots.txt.mjs.map
