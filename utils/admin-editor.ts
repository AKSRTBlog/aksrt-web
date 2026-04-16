import type { ArticleDetailItem } from '~/types/admin';

export type EditorStatus = 'draft' | 'published' | 'scheduled';
export type EditorViewMode = 'split' | 'edit' | 'preview';

export interface ObjectStorageAsset {
  url: string;
  objectKey: string;
  fileName: string;
  mimeType: string;
}

export interface ArticleEditorForm {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover: ObjectStorageAsset | null;
  contentMarkdown: string;
  categoryIds: string[];
  tagIds: string[];
  status: EditorStatus;
  allowComments: boolean;
  publishedAt: string | null;
  scheduledAt: string | null;
}

const editorDraftPrefix = 'quiet-letters-editor-draft';

export const editorTemplate = `# 输入文章标题

## 写作提纲
- 先概括这篇文章要解决的问题
- 再补充关键论点和例子
- 最后加上总结或行动建议

## 正文
从这里开始写 Markdown 内容。`;

export function sanitizeArticleSlug(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function slugifyArticleTitle(value: string) {
  return sanitizeArticleSlug(value) || `article-${Date.now().toString(36)}`;
}

export function estimateReadingTime(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/[#>*_[\]\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 220));
}

export function countWords(markdown: string) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]+`/g, ' ')
    .replace(/[#>*_[\]\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text ? text.split(' ').length : 0;
}

export function createEmptyArticleForm(defaultCategoryId?: string): ArticleEditorForm {
  return {
    id: `draft-${Date.now()}`,
    title: '',
    slug: '',
    excerpt: '',
    cover: null,
    contentMarkdown: editorTemplate,
    categoryIds: defaultCategoryId ? [defaultCategoryId] : [],
    tagIds: [],
    status: 'draft',
    allowComments: true,
    publishedAt: new Date().toISOString().slice(0, 16),
    scheduledAt: null,
  };
}

export function mapArticleToEditorForm(article: ArticleDetailItem): ArticleEditorForm {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    cover: article.coverImageUrl
      ? {
          url: article.coverImageUrl,
          objectKey: article.coverImageUrl,
          fileName: article.coverImageUrl.split('/').pop() ?? `${article.slug}.jpg`,
          mimeType: 'image/jpeg',
        }
      : null,
    contentMarkdown: article.content,
    categoryIds: article.categories.map((cat) => cat.id),
    tagIds: article.tags.map((tag) => tag.id),
    status: article.status,
    allowComments: article.allowComment,
    publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : new Date().toISOString().slice(0, 16),
    scheduledAt: null,
  };
}

export function saveDraftSnapshot(id: string, form: ArticleEditorForm) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`${editorDraftPrefix}:${id}`, JSON.stringify(form));
}

export function loadDraftSnapshot(id: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(`${editorDraftPrefix}:${id}`);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ArticleEditorForm;
  } catch {
    return null;
  }
}

export function clearDraftSnapshot(id: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(`${editorDraftPrefix}:${id}`);
}

export function insertTextAtSelection(
  textarea: HTMLTextAreaElement,
  before: string,
  after = '',
  placeholder = '',
) {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const nextValue = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
  const nextPosition = selectionStart + before.length + selected.length + after.length;

  return {
    value: nextValue,
    selectionStart: nextPosition,
    selectionEnd: nextPosition,
  };
}

export function buildMarkdownTable(rowCount: number, columnCount: number) {
  const rows = Math.max(1, Math.floor(rowCount));
  const columns = Math.max(1, Math.floor(columnCount));
  const headerCells = Array.from({ length: columns }, (_, index) => `表头${index + 1}`);
  const separatorCells = Array.from({ length: columns }, () => '---');
  const bodyRows = Math.max(0, rows - 1);
  const body = Array.from({ length: bodyRows }, (_, rowIndex) => {
    const cells = Array.from({ length: columns }, (_, columnIndex) => `内容${rowIndex + 1}-${columnIndex + 1}`);
    return `| ${cells.join(' | ')} |`;
  });

  return [`| ${headerCells.join(' | ')} |`, `| ${separatorCells.join(' | ')} |`, ...body].join('\n');
}

function toIsoDatetime(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function buildArticlePayload(
  form: ArticleEditorForm,
  targetStatus: 'draft' | 'published',
  isEditing: boolean,
) {
  const publishedAt =
    targetStatus === 'published'
      ? form.status === 'scheduled'
        ? toIsoDatetime(form.scheduledAt) || toIsoDatetime(form.publishedAt) || new Date().toISOString()
        : toIsoDatetime(form.publishedAt) || new Date().toISOString()
      : null;

  const payload: {
    title: string;
    excerpt: string;
    content: string;
    coverImageUrl: string | null;
    categoryIds: string[];
    tagIds: string[];
    status: 'draft' | 'published';
    allowComment: boolean;
    publishedAt: string | null;
    slug?: string;
  } = {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: form.contentMarkdown.trim(),
    coverImageUrl: form.cover?.url ?? null,
    categoryIds: form.categoryIds || [],
    tagIds: form.tagIds,
    status: targetStatus,
    allowComment: form.allowComments,
    publishedAt,
  };

  if (isEditing) {
    payload.slug = sanitizeArticleSlug(form.slug.trim());
  }

  return payload;
}
