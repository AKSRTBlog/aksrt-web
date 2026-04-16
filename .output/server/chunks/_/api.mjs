import { u as useRuntimeConfig } from './nitro.mjs';
import { marked } from 'marked';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}
function resolveApiBase(configuredApiBase) {
  if (!configuredApiBase) {
    return "";
  }
  const fallback = trimTrailingSlash(configuredApiBase);
  {
    return fallback;
  }
}
function resolveRuntimeApiBase(config) {
  const serverApiBase = String(config.apiBaseInternal || "");
  return resolveApiBase(serverApiBase );
}

const FALLBACK_COVER = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22675%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2364758b%22 font-family=%22sans-serif%22 font-size=%2242%22%3ENo Cover%3C/text%3E%3C/svg%3E";
marked.setOptions({
  gfm: true,
  breaks: true
});
function getFetchError(error) {
  return error;
}
async function apiFetch(path, init) {
  var _a, _b, _c;
  const config = useRuntimeConfig();
  const apiBase = resolveRuntimeApiBase(config);
  try {
    const response = await $fetch(`${apiBase}${path}`, init);
    return response.data;
  } catch (error) {
    const fetchError = getFetchError(error);
    const message = ((_a = fetchError.data) == null ? void 0 : _a.message) || ((_c = (_b = fetchError.response) == null ? void 0 : _b._data) == null ? void 0 : _c.message) || fetchError.message || "Public request failed.";
    throw new Error(message);
  }
}
function mapArticleSummary(item) {
  var _a;
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    coverImage: item.coverImageUrl || FALLBACK_COVER,
    publishedAt: (_a = item.publishedAt) != null ? _a : item.updatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    allowComment: item.allowComment,
    categories: item.categories || [],
    tags: item.tags || []
  };
}
function deriveTags(articles) {
  var _a;
  const map = /* @__PURE__ */ new Map();
  for (const article of articles) {
    for (const tag of article.tags) {
      const current = map.get(tag.slug);
      map.set(tag.slug, {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        count: ((_a = current == null ? void 0 : current.count) != null ? _a : 0) + 1
      });
    }
  }
  return [...map.values()].sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}
async function fetchPublicSiteSettings() {
  return apiFetch("/api/v1/public/site-settings");
}
async function fetchPublicCategories() {
  return apiFetch("/api/v1/public/articles/meta/categories");
}
async function fetchAllPublicArticles() {
  const items = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const result = await apiFetch(
      `/api/v1/public/articles?page=${page}&pageSize=500&sortBy=publishedAt&sortOrder=desc`
    );
    items.push(...result.list.map(mapArticleSummary));
    totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
    page += 1;
  }
  return items;
}
async function fetchPublicStandalonePages() {
  return apiFetch("/api/v1/public/site-settings/standalone-pages");
}

export { fetchAllPublicArticles as a, fetchPublicCategories as b, fetchPublicStandalonePages as c, deriveTags as d, fetchPublicSiteSettings as f };
//# sourceMappingURL=api.mjs.map
