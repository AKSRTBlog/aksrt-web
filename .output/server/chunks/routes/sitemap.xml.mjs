import { c as defineEventHandler, u as useRuntimeConfig } from '../_/nitro.mjs';
import { f as fetchPublicSiteSettings, a as fetchAllPublicArticles, b as fetchPublicCategories, c as fetchPublicStandalonePages, d as deriveTags } from '../_/api.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'marked';

function escapeXml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
const sitemap_xml = defineEventHandler(async () => {
  const [settings, articles, categories, pages] = await Promise.all([
    fetchPublicSiteSettings(),
    fetchAllPublicArticles(),
    fetchPublicCategories(),
    fetchPublicStandalonePages()
  ]);
  const baseUrl = settings.seo.canonicalUrl || useRuntimeConfig().public.siteUrl;
  const tags = deriveTags(articles);
  const urls = [
    { loc: `${baseUrl}/`, priority: "1.0", changefreq: "daily" },
    { loc: `${baseUrl}/articles`, priority: "0.9", changefreq: "daily" },
    { loc: `${baseUrl}/archive`, priority: "0.7", changefreq: "weekly" },
    { loc: `${baseUrl}/about`, priority: "0.7", changefreq: "monthly" },
    { loc: `${baseUrl}/links`, priority: "0.7", changefreq: "weekly" }
  ];
  for (const category of categories) {
    urls.push({
      loc: `${baseUrl}/categories/${category.slug}`,
      priority: "0.6",
      changefreq: "weekly"
    });
  }
  for (const tag of tags) {
    urls.push({
      loc: `${baseUrl}/tags/${tag.slug}`,
      priority: "0.5",
      changefreq: "weekly"
    });
  }
  for (const page of pages) {
    urls.push({
      loc: `${baseUrl}/pages/${page.slug}`,
      priority: "0.6",
      changefreq: "monthly"
    });
  }
  for (const article of articles) {
    urls.push({
      loc: `${baseUrl}/articles/${article.slug}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: new Date(article.updatedAt || article.publishedAt).toISOString().split("T")[0]
    });
  }
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => {
    return `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ""}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`;
  }).join("\n")}
</urlset>`;
  return new Response(body, {
    headers: {
      "content-type": "application/xml; charset=utf-8"
    }
  });
});

export { sitemap_xml as default };
//# sourceMappingURL=sitemap.xml.mjs.map
