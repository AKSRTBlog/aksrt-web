import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, nextTick, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$2 } from './AppImage-CpDcJIeD.mjs';
import { _ as _sfc_main$3 } from './MediaPickerDialog-CKbzUmQT.mjs';
import { t as renderMarkdown } from './api-9xEAR-2s.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import { c as createEmptyArticleForm, a as countWords, e as estimateReadingTime, d as slugifyArticleTitle, f as saveDraftSnapshot, g as buildArticlePayload, h as clearDraftSnapshot, m as mapArticleToEditorForm, i as insertTextAtSelection } from './admin-editor-CUf6Pf5Q.mjs';
import { a as adminPaths, b as formatAdminDate } from './admin-BhXx1q9A.mjs';
import { n as navigateTo } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminArticleEditor",
  __ssrInlineRender: true,
  props: {
    articleId: {}
  },
  setup(__props) {
    const props = __props;
    const { adminApiFetch } = useAdminSession();
    const isEditing = computed(() => Boolean(props.articleId));
    const draftKey = computed(() => {
      var _a;
      return (_a = props.articleId) != null ? _a : "new";
    });
    const textareaRef = ref(null);
    const mediaPickerMode = ref(null);
    const form = ref(createEmptyArticleForm());
    const options = ref({ categories: [], tags: [] });
    const loading = ref(true);
    const errorMessage = ref("");
    const successMessage = ref("");
    const recoveredDraft = ref(false);
    const persistedUpdatedAt = ref(null);
    const viewMode = ref("split");
    const actionState = ref(null);
    const previewHtml = computed(() => renderMarkdown(form.value.contentMarkdown));
    const wordCount = computed(() => countWords(form.value.contentMarkdown));
    const readingTime = computed(() => estimateReadingTime(form.value.contentMarkdown));
    const resolvedSlug = computed(
      () => isEditing.value ? form.value.slug : slugifyArticleTitle(form.value.title)
    );
    const selectedCategories = computed(
      () => options.value.categories.filter((item) => form.value.categoryIds.includes(item.id))
    );
    const selectedTags = computed(
      () => options.value.tags.filter((item) => form.value.tagIds.includes(item.id))
    );
    function updateForm(patch) {
      form.value = {
        ...form.value,
        ...patch
      };
    }
    function focusTextareaSelection(selectionStart, selectionEnd) {
      nextTick(() => {
        if (!textareaRef.value) {
          return;
        }
        textareaRef.value.focus();
        textareaRef.value.setSelectionRange(selectionStart, selectionEnd);
      });
    }
    function applyInsertion(builder) {
      if (!textareaRef.value) {
        viewMode.value = "edit";
        successMessage.value = "Switched to edit mode. Click the toolbar action again.";
        return;
      }
      const next = builder(textareaRef.value);
      updateForm({ contentMarkdown: next.value });
      focusTextareaSelection(next.selectionStart, next.selectionEnd);
    }
    function closeMediaPicker() {
      mediaPickerMode.value = null;
    }
    function resolveInlineImageAltText(asset) {
      var _a;
      const candidate = ((_a = asset.altText) == null ? void 0 : _a.trim()) || asset.title.trim() || asset.originalFilename.trim() || "image";
      return candidate.replace(/[\r\n]+/g, " ").replace(/[[\]]/g, "").trim() || "image";
    }
    function insertInlineImage(asset) {
      const performInsert = () => {
        if (!textareaRef.value) {
          errorMessage.value = "Editor is not ready for image insertion.";
          return;
        }
        const altText = resolveInlineImageAltText(asset);
        applyInsertion((textarea) => insertTextAtSelection(textarea, `
![${altText}](`, ")\n", asset.url));
        successMessage.value = "Image inserted.";
      };
      if (!textareaRef.value) {
        viewMode.value = "split";
        nextTick(performInsert);
        return;
      }
      performInsert();
    }
    function applyMediaSelection(asset) {
      errorMessage.value = "";
      if (mediaPickerMode.value === "cover") {
        updateForm({
          cover: {
            url: asset.url,
            objectKey: asset.filename,
            fileName: asset.originalFilename,
            mimeType: asset.mimeType
          }
        });
        successMessage.value = "Cover selected.";
        closeMediaPicker();
        return;
      }
      insertInlineImage(asset);
      closeMediaPicker();
    }
    function validateBeforeSave() {
      if (!form.value.title.trim()) {
        errorMessage.value = "Title is required.";
        return false;
      }
      if (!form.value.excerpt.trim()) {
        errorMessage.value = "Excerpt is required.";
        return false;
      }
      if (!form.value.contentMarkdown.trim()) {
        errorMessage.value = "Content is required.";
        return false;
      }
      if (!form.value.categoryIds.length) {
        errorMessage.value = "Select at least one category.";
        return false;
      }
      return true;
    }
    async function saveArticle(targetStatus) {
      if (!validateBeforeSave()) {
        return;
      }
      actionState.value = targetStatus === "draft" ? "save-draft" : "publish";
      errorMessage.value = "";
      successMessage.value = "";
      try {
        const payload = buildArticlePayload(form.value, targetStatus, isEditing.value);
        const saved = isEditing.value ? await adminApiFetch(`/api/v1/admin/articles/${props.articleId}`, {
          method: "PATCH",
          body: JSON.stringify(payload)
        }) : await adminApiFetch("/api/v1/admin/articles", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        clearDraftSnapshot(draftKey.value);
        form.value = mapArticleToEditorForm(saved);
        persistedUpdatedAt.value = saved.updatedAt;
        successMessage.value = targetStatus === "draft" ? "Draft saved." : "Article published.";
        if (!isEditing.value) {
          await navigateTo(adminPaths.articleEdit(saved.id));
          return;
        }
      } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : "Article save failed.";
      } finally {
        actionState.value = null;
      }
    }
    function saveLocalDraft() {
      saveDraftSnapshot(draftKey.value, form.value);
      successMessage.value = "Local draft saved.";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: unref(isEditing) ? "Edit Article" : "New Article",
        description: unref(isEditing) ? "Update title, excerpt, markdown content, and publishing settings." : "Create a new article draft or publish it directly."
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: unref(adminPaths).articles
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`Back to Articles`);
                } else {
                  return [
                    createTextVNode("Back to Articles")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="admin-button-secondary" type="button"${_scopeId}> Save Local Draft </button><button class="admin-button-secondary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(actionState))) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(actionState) === "save-draft" ? "Saving..." : "Save Draft")}</button><button class="admin-button-primary" type="button"${ssrIncludeBooleanAttr(Boolean(unref(actionState))) ? " disabled" : ""}${_scopeId}>${ssrInterpolate(unref(actionState) === "publish" ? "Publishing..." : unref(isEditing) ? "Update & Publish" : "Publish")}</button>`);
          } else {
            return [
              createVNode(_component_NuxtLink, {
                class: "admin-button-secondary",
                to: unref(adminPaths).articles
              }, {
                default: withCtx(() => [
                  createTextVNode("Back to Articles")
                ]),
                _: 1
              }, 8, ["to"]),
              createVNode("button", {
                class: "admin-button-secondary",
                type: "button",
                onClick: saveLocalDraft
              }, " Save Local Draft "),
              createVNode("button", {
                class: "admin-button-secondary",
                type: "button",
                disabled: Boolean(unref(actionState)),
                onClick: ($event) => saveArticle("draft")
              }, toDisplayString(unref(actionState) === "save-draft" ? "Saving..." : "Save Draft"), 9, ["disabled", "onClick"]),
              createVNode("button", {
                class: "admin-button-primary",
                type: "button",
                disabled: Boolean(unref(actionState)),
                onClick: ($event) => saveArticle("published")
              }, toDisplayString(unref(actionState) === "publish" ? "Publishing..." : unref(isEditing) ? "Update & Publish" : "Publish"), 9, ["disabled", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(recoveredDraft)) {
        _push(`<div class="rounded-[4px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700"> Local draft restored for this article. </div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(errorMessage)) {
        _push(`<div class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">${ssrInterpolate(unref(errorMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">${ssrInterpolate(unref(successMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-white/80 px-5 py-10 text-sm text-slate-500"> Loading editor... </div>`);
      } else {
        _push(`<section class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div class="space-y-6"><div class="admin-card p-5"><div class="grid gap-4 lg:grid-cols-2"><label class="block lg:col-span-2"><span class="mb-2 block text-sm font-medium text-slate-700">Title</span><input class="admin-input"${ssrRenderAttr("value", unref(form).title)} placeholder="Article title"></label><label class="block lg:col-span-2"><span class="mb-2 block text-sm font-medium text-slate-700">Excerpt</span><textarea class="admin-textarea min-h-28" placeholder="Article excerpt">${ssrInterpolate(unref(form).excerpt)}</textarea></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700"> Slug${ssrInterpolate(unref(isEditing) ? "" : " (auto generated on first save)")}</span><input class="admin-input"${ssrRenderAttr("value", unref(resolvedSlug))}${ssrIncludeBooleanAttr(!unref(isEditing)) ? " disabled" : ""} placeholder="Article slug"></label><div class="rounded-[4px] border border-[var(--admin-border)] bg-slate-50 px-4 py-3"><p class="text-sm font-medium text-slate-900">Writing Stats</p><div class="mt-2 space-y-1 text-sm text-slate-500"><p>Words: ${ssrInterpolate(unref(wordCount))}</p><p>Reading Time: ${ssrInterpolate(unref(readingTime))} min</p><p>Status: ${ssrInterpolate(unref(form).status)}</p></div></div></div></div><div class="admin-card overflow-hidden"><div class="flex flex-wrap items-center gap-2 border-b border-[var(--admin-border)] bg-slate-50/90 px-4 py-3"><button class="admin-toolbar-button" type="button">H1</button><button class="admin-toolbar-button" type="button">H2</button><button class="admin-toolbar-button" type="button">H3</button><button class="admin-toolbar-button" type="button">Bold</button><button class="admin-toolbar-button" type="button">Italic</button><button class="admin-toolbar-button" type="button">Quote</button><button class="admin-toolbar-button" type="button">Code</button><button class="admin-toolbar-button" type="button">List</button><button class="admin-toolbar-button" type="button">Link</button><button class="admin-toolbar-button" type="button">Table</button><button class="admin-toolbar-button" type="button">Image URL</button><button class="admin-toolbar-button" type="button"> Media Image </button><div class="ml-auto flex flex-wrap gap-2"><button class="${ssrRenderClass([{ "admin-button-primary": unref(viewMode) === "edit" }, "admin-button-secondary"])}" type="button"> Edit </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(viewMode) === "split" }, "admin-button-secondary"])}" type="button"> Split </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(viewMode) === "preview" }, "admin-button-secondary"])}" type="button"> Preview </button></div></div><div class="${ssrRenderClass([unref(viewMode) === "split" ? "lg:grid-cols-2" : "grid-cols-1", "grid"])}">`);
        if (unref(viewMode) !== "preview") {
          _push(`<div class="${ssrRenderClass([unref(viewMode) === "split" ? "border-r border-[var(--admin-border)]" : "", "h-[720px] overflow-y-auto"])}"><textarea class="admin-editor-textarea h-full" placeholder="Write markdown content here...">${ssrInterpolate(unref(form).contentMarkdown)}</textarea></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(viewMode) !== "edit") {
          _push(`<div class="${ssrRenderClass([unref(viewMode) === "preview" ? "" : "bg-white", "h-[720px] overflow-y-auto"])}"><article class="article-content admin-markdown-preview mx-auto max-w-none px-6 py-6">${(_a = unref(previewHtml)) != null ? _a : ""}</article></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><aside class="space-y-6"><div class="admin-card p-5"><div class="flex items-center justify-between gap-3"><div><p class="text-sm font-semibold text-slate-900">Cover Image</p><p class="mt-1 text-sm text-slate-500">Choose from the media library or upload a new cover image.</p></div><button class="admin-button-secondary" type="button"> Choose Cover </button></div>`);
        if (unref(form).cover) {
          _push(`<div class="mt-4 overflow-hidden rounded-[4px] bg-slate-100">`);
          _push(ssrRenderComponent(_sfc_main$2, {
            class: "aspect-[16/10] w-full object-cover",
            src: unref(form).cover.url,
            alt: unref(form).cover.fileName,
            loading: "eager"
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<button class="admin-upload-dropzone mt-4" type="button"> Open Media Library </button>`);
        }
        if (unref(form).cover) {
          _push(`<div class="mt-4 space-y-2 text-xs text-slate-500"><p>File: ${ssrInterpolate(unref(form).cover.fileName)}</p><p class="break-all">URL: ${ssrInterpolate(unref(form).cover.url)}</p><button class="admin-button-danger mt-2" type="button"> Remove Cover </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="admin-card p-5"><h3 class="text-sm font-semibold text-slate-900">Publishing</h3><div class="mt-4 space-y-5"><div><span class="mb-2 block text-sm font-medium text-slate-700">Categories</span><div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(options).categories, (category) => {
          _push(`<button type="button" class="${ssrRenderClass(unref(form).categoryIds.includes(category.id) ? "admin-tag-button-active" : "admin-tag-button")}">${ssrInterpolate(category.name)}</button>`);
        });
        _push(`<!--]--></div></div><div><span class="mb-2 block text-sm font-medium text-slate-700">Tags</span><div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(options).tags, (tag) => {
          _push(`<button type="button" class="${ssrRenderClass(unref(form).tagIds.includes(tag.id) ? "admin-tag-button-active" : "admin-tag-button")}"> #${ssrInterpolate(tag.name)}</button>`);
        });
        _push(`<!--]--></div></div><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">Status</span><select class="admin-select"${ssrRenderAttr("value", unref(form).status)}><option value="draft">Draft</option><option value="published">Published</option><option value="scheduled">Scheduled</option></select></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">${ssrInterpolate(unref(form).status === "scheduled" ? "Scheduled At" : "Published At")}</span><input class="admin-input" type="datetime-local"${ssrRenderAttr("value", unref(form).status === "scheduled" ? (_b = unref(form).scheduledAt) != null ? _b : "" : (_c = unref(form).publishedAt) != null ? _c : "")}></label><label class="flex items-center justify-between gap-4 rounded-[4px] border border-[var(--admin-border)] px-4 py-3"><div><p class="text-sm font-medium text-slate-900">Allow Comments</p><p class="mt-1 text-xs text-slate-500">Disable this if the article should not accept new comments.</p></div><button class="${ssrRenderClass(unref(form).allowComments ? "admin-switch admin-switch-on" : "admin-switch")}" type="button"><span class="admin-switch-thumb"></span></button></label><div class="rounded-[4px] bg-slate-50 p-4"><div class="text-sm font-medium text-slate-900">Article Summary</div><div class="mt-3 space-y-2 text-sm text-slate-500"><p>Categories: ${ssrInterpolate(unref(selectedCategories).length ? unref(selectedCategories).map((item) => item.name).join(" / ") : "None")}</p><p>Tags: ${ssrInterpolate(unref(selectedTags).length ? unref(selectedTags).map((item) => item.name).join(" / ") : "None")}</p><p>Slug: ${ssrInterpolate(unref(resolvedSlug))}</p>`);
        if (unref(persistedUpdatedAt)) {
          _push(`<p>Updated: ${ssrInterpolate(unref(formatAdminDate)(unref(persistedUpdatedAt)))}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div></aside></section>`);
      }
      _push(ssrRenderComponent(_sfc_main$3, {
        open: Boolean(unref(mediaPickerMode)),
        title: unref(mediaPickerMode) === "cover" ? "Choose Cover Image" : "Choose Inline Image",
        "empty-message": "No images are available yet. Upload one from this dialog to use it in the article.",
        "search-placeholder": "Search media library images",
        "upload-usage": unref(mediaPickerMode) === "cover" ? "article_cover" : "article_content",
        onClose: closeMediaPicker,
        onSelect: applyMediaSelection
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminArticleEditor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminArticleEditor-DHEmFyUW.mjs.map
