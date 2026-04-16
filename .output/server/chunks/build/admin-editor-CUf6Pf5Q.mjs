const editorTemplate = `# \u8F93\u5165\u6587\u7AE0\u6807\u9898

## \u5199\u4F5C\u63D0\u7EB2
- \u5148\u6982\u62EC\u8FD9\u7BC7\u6587\u7AE0\u8981\u89E3\u51B3\u7684\u95EE\u9898
- \u518D\u8865\u5145\u5173\u952E\u8BBA\u70B9\u548C\u4F8B\u5B50
- \u6700\u540E\u52A0\u4E0A\u603B\u7ED3\u6216\u884C\u52A8\u5EFA\u8BAE

## \u6B63\u6587
\u4ECE\u8FD9\u91CC\u5F00\u59CB\u5199 Markdown \u5185\u5BB9\u3002`;
function sanitizeArticleSlug(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function slugifyArticleTitle(value) {
  return sanitizeArticleSlug(value) || `article-${Date.now().toString(36)}`;
}
function estimateReadingTime(markdown) {
  const text = markdown.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]+`/g, " ").replace(/[#>*_[\]\-]/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.ceil(words / 220));
}
function countWords(markdown) {
  const text = markdown.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]+`/g, " ").replace(/[#>*_[\]\-]/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(" ").length : 0;
}
function createEmptyArticleForm(defaultCategoryId) {
  return {
    id: `draft-${Date.now()}`,
    title: "",
    slug: "",
    excerpt: "",
    cover: null,
    contentMarkdown: editorTemplate,
    categoryIds: defaultCategoryId ? [defaultCategoryId] : [],
    tagIds: [],
    status: "draft",
    allowComments: true,
    publishedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    scheduledAt: null
  };
}
function mapArticleToEditorForm(article) {
  var _a;
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    cover: article.coverImageUrl ? {
      url: article.coverImageUrl,
      objectKey: article.coverImageUrl,
      fileName: (_a = article.coverImageUrl.split("/").pop()) != null ? _a : `${article.slug}.jpg`,
      mimeType: "image/jpeg"
    } : null,
    contentMarkdown: article.content,
    categoryIds: article.categories.map((cat) => cat.id),
    tagIds: article.tags.map((tag) => tag.id),
    status: article.status,
    allowComments: article.allowComment,
    publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
    scheduledAt: null
  };
}
function saveDraftSnapshot(id, form) {
  {
    return;
  }
}
function clearDraftSnapshot(id) {
  {
    return;
  }
}
function insertTextAtSelection(textarea, before, after = "", placeholder = "") {
  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd) || placeholder;
  const nextValue = `${value.slice(0, selectionStart)}${before}${selected}${after}${value.slice(selectionEnd)}`;
  const nextPosition = selectionStart + before.length + selected.length + after.length;
  return {
    value: nextValue,
    selectionStart: nextPosition,
    selectionEnd: nextPosition
  };
}
function buildMarkdownTable(rowCount, columnCount) {
  const rows = Math.max(1, Math.floor(rowCount));
  const columns = Math.max(1, Math.floor(columnCount));
  const headerCells = Array.from({ length: columns }, (_, index) => `\u8868\u5934${index + 1}`);
  const separatorCells = Array.from({ length: columns }, () => "---");
  const bodyRows = Math.max(0, rows - 1);
  const body = Array.from({ length: bodyRows }, (_, rowIndex) => {
    const cells = Array.from({ length: columns }, (_2, columnIndex) => `\u5185\u5BB9${rowIndex + 1}-${columnIndex + 1}`);
    return `| ${cells.join(" | ")} |`;
  });
  return [`| ${headerCells.join(" | ")} |`, `| ${separatorCells.join(" | ")} |`, ...body].join("\n");
}
function toIsoDatetime(value) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function buildArticlePayload(form, targetStatus, isEditing) {
  var _a, _b;
  const publishedAt = targetStatus === "published" ? form.status === "scheduled" ? toIsoDatetime(form.scheduledAt) || toIsoDatetime(form.publishedAt) || (/* @__PURE__ */ new Date()).toISOString() : toIsoDatetime(form.publishedAt) || (/* @__PURE__ */ new Date()).toISOString() : null;
  const payload = {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: form.contentMarkdown.trim(),
    coverImageUrl: (_b = (_a = form.cover) == null ? void 0 : _a.url) != null ? _b : null,
    categoryIds: form.categoryIds || [],
    tagIds: form.tagIds,
    status: targetStatus,
    allowComment: form.allowComments,
    publishedAt
  };
  if (isEditing) {
    payload.slug = sanitizeArticleSlug(form.slug.trim());
  }
  return payload;
}

export { countWords as a, buildMarkdownTable as b, createEmptyArticleForm as c, slugifyArticleTitle as d, estimateReadingTime as e, saveDraftSnapshot as f, buildArticlePayload as g, clearDraftSnapshot as h, insertTextAtSelection as i, mapArticleToEditorForm as m, sanitizeArticleSlug as s };
//# sourceMappingURL=admin-editor-CUf6Pf5Q.mjs.map
