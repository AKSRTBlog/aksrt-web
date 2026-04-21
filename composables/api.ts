import { marked } from 'marked';
import type { FetchError } from 'ofetch';
import { estimateReadingTime } from '~/utils/admin-editor';
import type {
  ApiEnvelope,
  ArchiveYearGroup,
  BlogArticleDetail,
  BlogArticleSummary,
  BlogCategory,
  BlogComment,
  BlogTag,
  ContributionData,
  PaginatedResponse,
  PublicArticleCategoryItem,
  PublicArticleDetailItem,
  PublicArticleSummaryItem,
  PublicBannerItem,
  PublicCaptchaConfig,
  PublicCommentItem,
  PublicFooterLinkItem,
  PublicProjectItem,
  PublicSiteSettingsItem,
  PublicSyncVersionItem,
  PublicStandalonePageDetailItem,
  PublicStandalonePageSummaryItem,
} from '~/types/blog';
import { resolveRuntimeApiBase } from '~/utils/api-base';

type ArticleSort = 'latest' | 'popular' | 'reading';

const FALLBACK_COVER =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%221200%22 height=%22675%22 viewBox=%220 0 1200 675%22%3E%3Crect width=%221200%22 height=%22675%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%2364758b%22 font-family=%22sans-serif%22 font-size=%2242%22%3ENo Cover%3C/text%3E%3C/svg%3E';

export const blogAuthor = {
  id: 'default-author',
  name: 'Kate',
  avatar: 'https://cravatar.cn/avatar/70061913523553034d98bdb9cbecd3ac?s=160&d=identicon',
  bio: 'Engineer, writer, and product-minded builder documenting systems, implementation details, and long-term practice.',
  github: 'https://github.com/Lexo0522',
};

marked.setOptions({
  gfm: true,
  breaks: true,
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getFetchError(error: unknown) {
  return error as FetchError<ApiEnvelope<never>>;
}

export function renderMarkdown(markdown: unknown) {
  const safeMarkdown = typeof markdown === 'string' ? markdown : '';
  const renderer = new marked.Renderer();

  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((token) => ('text' in token ? token.text : '')).join('');
    const id = slugify(text);
    return `<h${depth} id="${id}" class="scroll-mt-24">${marked.Parser.parseInline(tokens)}</h${depth}>`;
  };

  renderer.image = ({ href, title, text }) => {
    return `<img src="${typeof href === 'string' ? href : ''}" alt="${typeof text === 'string' ? text : ''}" title="${typeof title === 'string' ? title : ''}" loading="lazy" />`;
  };

  return marked.parse(safeMarkdown, { renderer }) as string;
}

async function apiFetch<T>(path: string, init?: Parameters<typeof $fetch<ApiEnvelope<T>>>[1]) {
  const config = useRuntimeConfig();
  const apiBase = resolveRuntimeApiBase(config);

  try {
    const response = await $fetch<ApiEnvelope<T>>(`${apiBase}${path}`, init);
    return response.data;
  } catch (error) {
    const fetchError = getFetchError(error);
    const message =
      fetchError.data?.message ||
      fetchError.response?._data?.message ||
      fetchError.message ||
      'Public request failed.';

    throw new Error(message);
  }
}

function mapArticleSummary(item: PublicArticleSummaryItem): BlogArticleSummary {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    coverImage: item.coverImageUrl || FALLBACK_COVER,
    publishedAt: item.publishedAt ?? item.updatedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    allowComment: item.allowComment,
    categories: item.categories || [],
    tags: item.tags || [],
  };
}

function mapArticleDetail(item: PublicArticleDetailItem): BlogArticleDetail {
  return {
    ...mapArticleSummary(item),
    content: item.content,
    readingTime: estimateReadingTime(item.content),
  };
}

function mapComment(item: PublicCommentItem): BlogComment {
  return {
    id: item.id,
    parentId: item.parentId,
    nickname: item.nickname,
    avatarUrl: item.avatarUrl,
    content: item.content,
    createdAt: item.createdAt,
    replies: item.replies.map(mapComment),
  };
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export function sortArticles(list: BlogArticleSummary[], sort: ArticleSort = 'latest') {
  const next = [...list];

  if (sort === 'reading') {
    return next.sort((left, right) => estimateReadingTime(right.excerpt) - estimateReadingTime(left.excerpt));
  }

  if (sort === 'popular') {
    return next.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  }

  return next.sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

export function filterArticles(
  list: BlogArticleSummary[],
  options: { keyword?: string; category?: string; tag?: string; sort?: ArticleSort } = {},
) {
  const { keyword = '', category, tag, sort = 'latest' } = options;
  const needle = keyword.trim().toLowerCase();

  const filtered = list.filter((article) => {
    if (category && !article.categories.some((cat) => cat.slug === category)) {
      return false;
    }

    if (tag && !article.tags.some((item) => item.slug === tag)) {
      return false;
    }

    if (!needle) {
      return true;
    }

    return [article.title, article.excerpt, ...article.categories.map((cat) => cat.name), ...article.tags.map((item) => item.name)]
      .join(' ')
      .toLowerCase()
      .includes(needle);
  });

  return sortArticles(filtered, sort);
}

export function deriveCategories(articles: BlogArticleSummary[]): BlogCategory[] {
  const map = new Map<string, BlogCategory>();

  for (const article of articles) {
    for (const cat of article.categories) {
      const current = map.get(cat.slug);
      map.set(cat.slug, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return [...map.values()].sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function mergeCategories(categories: PublicArticleCategoryItem[], articles: BlogArticleSummary[]): BlogCategory[] {
  const counts = new Map<string, number>();

  for (const article of articles) {
    for (const cat of article.categories) {
      counts.set(cat.slug, (counts.get(cat.slug) ?? 0) + 1);
    }
  }

  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: counts.get(category.slug) ?? 0,
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function deriveTags(articles: BlogArticleSummary[]): BlogTag[] {
  const map = new Map<string, BlogTag>();

  for (const article of articles) {
    for (const tag of article.tags) {
      const current = map.get(tag.slug);
      map.set(tag.slug, {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  return [...map.values()].sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function buildArchiveGroups(articles: BlogArticleSummary[]): ArchiveYearGroup[] {
  const grouped = new Map<string, Map<string, BlogArticleSummary[]>>();

  for (const article of articles) {
    const date = new Date(article.publishedAt);
    const year = String(date.getFullYear());
    const month = date.toLocaleDateString('zh-CN', { month: 'long' });

    if (!grouped.has(year)) {
      grouped.set(year, new Map());
    }

    const yearGroup = grouped.get(year)!;
    if (!yearGroup.has(month)) {
      yearGroup.set(month, []);
    }

    yearGroup.get(month)!.push(article);
  }

  return [...grouped.entries()]
    .sort((left, right) => Number(right[0]) - Number(left[0]))
    .map(([year, months]) => ({
      year,
      total: [...months.values()].flat().length,
      months: [...months.entries()].map(([month, items]) => ({
        month,
        items: items.sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime()),
      })),
    }));
}

export async function fetchPublicSiteSettings() {
  return apiFetch<PublicSiteSettingsItem>('/api/v1/public/site-settings');
}

export async function fetchPublicCategories() {
  return apiFetch<PublicArticleCategoryItem[]>('/api/v1/public/articles/meta/categories');
}

export async function fetchPublicBanners(position?: string) {
  const query = position ? `?position=${encodeURIComponent(position)}` : '';
  return apiFetch<PublicBannerItem[]>(`/api/v1/public/banners${query}`);
}

export async function fetchPublicArticles(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categorySlug?: string;
  tagSlug?: string;
  sortBy?: 'publishedAt' | 'createdAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}) {
  const search = new URLSearchParams({
    page: String(params.page ?? 1),
    pageSize: String(params.pageSize ?? 20),
    sortBy: params.sortBy ?? 'publishedAt',
    sortOrder: params.sortOrder ?? 'desc',
  });

  if (params.keyword?.trim()) {
    search.set('keyword', params.keyword.trim());
  }

  if (params.categorySlug?.trim()) {
    search.set('categorySlug', params.categorySlug.trim());
  }

  if (params.tagSlug?.trim()) {
    search.set('tagSlug', params.tagSlug.trim());
  }

  const result = await apiFetch<PaginatedResponse<PublicArticleSummaryItem>>(`/api/v1/public/articles?${search.toString()}`);
  return {
    ...result,
    list: result.list.map(mapArticleSummary),
  };
}

export async function fetchAllPublicArticles() {
  const items: BlogArticleSummary[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await apiFetch<PaginatedResponse<PublicArticleSummaryItem>>(
      `/api/v1/public/articles?page=${page}&pageSize=500&sortBy=publishedAt&sortOrder=desc`,
    );

    items.push(...result.list.map(mapArticleSummary));
    totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
    page += 1;
  }

  return items;
}

export async function fetchPublicArticleDetail(slug: string) {
  const result = await apiFetch<PublicArticleDetailItem>(`/api/v1/public/articles/${slug}`);
  return mapArticleDetail(result);
}

export async function fetchPublicComments(slug: string) {
  const result = await apiFetch<PaginatedResponse<PublicCommentItem>>(
    `/api/v1/public/articles/${slug}/comments?page=1&pageSize=100`,
  );

  return result.list.map(mapComment);
}

export async function submitPublicComment(
  slug: string,
  input: {
    nickname: string;
    email: string;
    content: string;
    website?: string;
    parentId?: string | null;
    captcha?: Record<string, string>;
  },
) {
  return apiFetch<{ id: string; status: 'pending' | 'approved' | 'rejected' }>(
    `/api/v1/public/articles/${slug}/comments`,
    {
      method: 'POST',
      body: input,
    },
  );
}

export async function fetchPublicStandalonePages() {
  return apiFetch<PublicStandalonePageSummaryItem[]>('/api/v1/public/site-settings/standalone-pages');
}

export async function fetchPublicStandalonePage(slug: string) {
  return apiFetch<PublicStandalonePageDetailItem>(`/api/v1/public/site-settings/standalone-pages/${slug}`);
}

export async function fetchPublicProjects() {
  return apiFetch<PublicProjectItem[]>('/api/v1/public/projects');
}

export async function fetchActivityStats() {
  return apiFetch<ContributionData>('/api/v1/public/activity-stats/contributions');
}

export async function fetchPublicFooterLinks() {
  return apiFetch<PublicFooterLinkItem[]>('/api/v1/public/site-settings/footer-links');
}

export async function submitPublicFriendLinkApplication(input: {
  siteName: string;
  siteUrl: string;
  iconUrl?: string;
  description: string;
  contactName: string;
  contactEmail: string;
  message?: string;
  captcha?: Record<string, string>;
}) {
  return apiFetch<{ id: string; status: 'pending' | 'approved' | 'rejected' }>(
    '/api/v1/public/friend-link-applications',
    {
      method: 'POST',
      body: input,
    },
  );
}

export async function fetchCaptchaConfig() {
  return apiFetch<PublicCaptchaConfig>('/api/v1/public/site-settings/captcha');
}

export async function fetchPublicSyncVersion() {
  return apiFetch<PublicSyncVersionItem>('/api/v1/public/sync-version');
}
