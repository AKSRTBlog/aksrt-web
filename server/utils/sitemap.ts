import {
  fetchAllPublicArticles,
  fetchPublicCategories,
  fetchPublicSiteSettings,
  fetchPublicStandalonePages,
} from '~/composables/api';
import type { BlogArticleSummary } from '~/types/blog';

export const SITEMAP_MAX_URLS = 50000;

type Changefreq = 'daily' | 'weekly' | 'monthly';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: Changefreq;
  priority: string;
}

export interface SitemapPayload {
  baseUrl: string;
  entries: SitemapEntry[];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function normalizeBaseUrl(value: unknown): string {
  const raw = typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  if (!raw) return '';

  try {
    const url = new URL(raw);
    return url.origin + url.pathname.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function encodeSlug(slug: unknown): string {
  const raw = typeof slug === 'string' ? slug.trim() : '';
  if (!raw) return '';

  return raw
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  if (timestamp > Date.now()) return null;

  return timestamp;
}

function formatSitemapDate(value: unknown): string {
  const timestamp = parseTimestamp(value);
  return timestamp === null ? '' : new Date(timestamp).toISOString().slice(0, 10);
}

function pickLatest(left: string, right: unknown): string {
  const leftTime = parseTimestamp(left);
  const rightTime = parseTimestamp(right);

  if (rightTime === null) return left;
  if (leftTime === null || rightTime > leftTime) {
    return new Date(rightTime).toISOString();
  }

  return left;
}

function articleLastmod(article: BlogArticleSummary): string {
  return pickLatest(article.publishedAt || '', article.updatedAt);
}

function addLatest(map: Map<string, string>, slug: string, value: unknown) {
  if (!slug) return;
  map.set(slug, pickLatest(map.get(slug) || '', value));
}

function sortEntries(entries: SitemapEntry[]): SitemapEntry[] {
  return [...entries].sort((left, right) => {
    const priorityDelta = Number.parseFloat(right.priority) - Number.parseFloat(left.priority);
    if (priorityDelta !== 0) return priorityDelta;

    const rightTime = parseTimestamp(right.lastmod) ?? 0;
    const leftTime = parseTimestamp(left.lastmod) ?? 0;
    return rightTime - leftTime || left.loc.localeCompare(right.loc);
  });
}

export function splitSitemapEntries(entries: SitemapEntry[]): SitemapEntry[][] {
  const chunks: SitemapEntry[][] = [];
  for (let index = 0; index < entries.length; index += SITEMAP_MAX_URLS) {
    chunks.push(entries.slice(index, index + SITEMAP_MAX_URLS));
  }
  return chunks;
}

export function renderSitemap(entries: SitemapEntry[]): string {
  const urlEntries = entries.map(renderUrlEntry).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlEntries}
</urlset>`;
}

export function renderSitemapIndex(baseUrl: string, chunkCount: number): string {
  const entries = Array.from({ length: chunkCount }, (_, index) => `  <sitemap>
    <loc>${escapeXml(`${baseUrl}/sitemaps/${index + 1}.xml`)}</loc>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;
}

export async function buildSitemapPayload(): Promise<SitemapPayload> {
  const [settings, articles, categories, pages] = await Promise.all([
    fetchPublicSiteSettings(),
    fetchAllPublicArticles(),
    fetchPublicCategories(),
    fetchPublicStandalonePages(),
  ]);

  const runtimeSiteUrl = useRuntimeConfig().public.siteUrl;
  const baseUrl = normalizeBaseUrl(settings?.seo?.canonicalUrl) || normalizeBaseUrl(runtimeSiteUrl);
  if (!baseUrl) {
    return { baseUrl: '', entries: [] };
  }

  const latestByCategory = new Map<string, string>();
  const latestByTag = new Map<string, string>();

  for (const article of articles) {
    const lastmod = articleLastmod(article);
    for (const category of article.categories || []) {
      addLatest(latestByCategory, category.slug, lastmod);
    }
    for (const tag of article.tags || []) {
      addLatest(latestByTag, tag.slug, lastmod);
    }
  }

  const urlMap = new Map<string, SitemapEntry>();
  const addUrl = (path: string, lastmod: unknown, changefreq: Changefreq, priority: string) => {
    const loc = `${baseUrl}${path}`;
    const next: SitemapEntry = {
      loc,
      lastmod: formatSitemapDate(lastmod),
      changefreq,
      priority,
    };
    const existing = urlMap.get(loc);

    if (!existing) {
      urlMap.set(loc, next);
      return;
    }

    urlMap.set(loc, {
      ...existing,
      priority: Math.max(Number.parseFloat(existing.priority), Number.parseFloat(next.priority)).toFixed(1),
      lastmod: formatSitemapDate(pickLatest(existing.lastmod, next.lastmod)),
      changefreq: Number.parseFloat(next.priority) > Number.parseFloat(existing.priority) ? next.changefreq : existing.changefreq,
    });
  };

  addUrl('/', undefined, 'daily', '1.0');
  addUrl('/articles', undefined, 'daily', '0.9');
  addUrl('/archive', undefined, 'weekly', '0.7');
  addUrl('/about', undefined, 'monthly', '0.7');
  addUrl('/links', undefined, 'weekly', '0.7');

  for (const category of categories) {
    const slug = encodeSlug(category.slug);
    if (slug) {
      addUrl(`/categories/${slug}`, latestByCategory.get(category.slug), 'weekly', '0.6');
    }
  }

  for (const [rawSlug, lastmod] of latestByTag) {
    const slug = encodeSlug(rawSlug);
    if (slug) {
      addUrl(`/tags/${slug}`, lastmod, 'weekly', '0.5');
    }
  }

  for (const page of pages) {
    const slug = encodeSlug(page.slug);
    if (slug) {
      addUrl(`/pages/${slug}`, undefined, 'monthly', '0.6');
    }
  }

  for (const article of articles) {
    const slug = encodeSlug(article.slug);
    if (slug) {
      addUrl(`/articles/${slug}`, articleLastmod(article), 'weekly', '0.8');
    }
  }

  return {
    baseUrl,
    entries: sortEntries([...urlMap.values()]),
  };
}

function renderUrlEntry(entry: SitemapEntry): string {
  const lastmodXml = entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>\n` : '';

  return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
${lastmodXml}    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}
