import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, ref, resolveComponent, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, createCommentVNode, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderTeleport, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$2 } from './MediaPickerDialog-CKbzUmQT.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { b as buildMarkdownTable, i as insertTextAtSelection, s as sanitizeArticleSlug } from './admin-editor-CUf6Pf5Q.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './admin-media-DKXf4jjq.mjs';
import './api-base-COxdl8qP.mjs';

function useAdminStandalonePages() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const activeId = ref(null);
  const activePage = computed(
    () => {
      var _a, _b;
      return (_b = (_a = items.value.find((item) => item.id === activeId.value)) != null ? _a : items.value[0]) != null ? _b : null;
    }
  );
  function showMessage(msg, isError2 = false) {
    if (isError2) {
      error.value = msg;
      successMessage.value = "";
    } else {
      successMessage.value = msg;
      error.value = "";
    }
    if (msg) {
      setTimeout(() => {
        error.value = "";
        successMessage.value = "";
      }, 3e3);
    }
  }
  function makePage() {
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `page-${Date.now()}`,
      title: "",
      slug: "",
      summary: "",
      content: "",
      sortOrder: 0,
      enabled: true,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async function loadPages() {
    var _a, _b, _c;
    loading.value = true;
    error.value = "";
    try {
      const result = await adminApiFetch("/api/v1/admin/site-settings/standalone-pages");
      const nextItems = result.length > 0 ? result : [makePage()];
      items.value = nextItems;
      activeId.value = (_c = (_b = activeId.value) != null ? _b : (_a = nextItems[0]) == null ? void 0 : _a.id) != null ? _c : null;
      showMessage("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u52A0\u8F7D\u72EC\u7ACB\u9875\u5931\u8D25", true);
    } finally {
      loading.value = false;
    }
  }
  async function savePages() {
    var _a, _b, _c, _d;
    const validItems = items.value.filter(
      (item) => item.title.trim() && item.slug.trim() && item.summary.trim() && item.content.trim()
    );
    if (validItems.length === 0) {
      showMessage("\u8BF7\u81F3\u5C11\u5B8C\u6574\u586B\u5199\u4E00\u4E2A\u72EC\u7ACB\u9875\uFF08\u6807\u9898\u3001Slug\u3001\u6458\u8981\u3001\u5185\u5BB9\uFF09", true);
      return;
    }
    saving.value = true;
    try {
      const payload = validItems.map((item, index) => ({
        id: item.id,
        title: item.title.trim(),
        slug: sanitizeArticleSlug(item.slug.trim()),
        summary: item.summary.trim(),
        content: item.content.trim(),
        sortOrder: index,
        enabled: item.enabled
      }));
      const result = await adminApiFetch("/api/v1/admin/site-settings/standalone-pages", {
        method: "PUT",
        body: JSON.stringify({ items: payload })
      });
      const nextItems = result.length > 0 ? result : [makePage()];
      items.value = nextItems;
      activeId.value = (_d = (_c = (_a = nextItems.find((item) => item.id === activeId.value)) == null ? void 0 : _a.id) != null ? _c : (_b = nextItems[0]) == null ? void 0 : _b.id) != null ? _d : null;
      showMessage("\u72EC\u7ACB\u9875\u5DF2\u4FDD\u5B58");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  function updateItem(id, updater) {
    items.value = items.value.map((item) => item.id === id ? updater(item) : item);
  }
  function moveItem(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.value.length)
      return;
    const next = [...items.value];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    items.value = next;
  }
  function addPage() {
    const next = makePage();
    items.value = [...items.value, next];
    activeId.value = next.id;
  }
  function removePage(id) {
    let next = items.value.filter((item) => item.id !== id);
    if (next.length === 0) {
      const fallback = makePage();
      activeId.value = fallback.id;
      items.value = [fallback];
      return;
    }
    if (activeId.value === id) {
      activeId.value = next[0].id;
    }
    items.value = next;
  }
  function selectPage(id) {
    activeId.value = id;
  }
  return {
    // 状态
    items,
    loading,
    saving,
    error,
    successMessage,
    activeId,
    activePage,
    // 工具函数
    makePage,
    sanitizeArticleSlug,
    insertTextAtSelection,
    buildMarkdownTable,
    // 方法
    loadPages,
    savePages,
    updateItem,
    moveItem,
    addPage,
    removePage,
    selectPage
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "pages",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u72EC\u7ACB\u9875\u9762"
    });
    const {
      items,
      loading,
      saving,
      error,
      successMessage,
      activePage,
      insertTextAtSelection: insertTextAtSelection2,
      loadPages,
      savePages,
      updateItem
    } = useAdminStandalonePages();
    const viewMode = ref("split");
    const mediaPickerOpen = ref(false);
    const textareaRef = ref(null);
    const externalImageDialogOpen = ref(false);
    const externalImageUrl = ref("https://");
    const tableDialogOpen = ref(false);
    const tableRowCount = ref("3");
    const tableColumnCount = ref("3");
    function handleToolbarAction(action) {
      const textarea = textareaRef.value;
      if (!textarea || !activePage.value)
        return;
      if (action === "table") {
        tableRowCount.value = "3";
        tableColumnCount.value = "3";
        tableDialogOpen.value = true;
        return;
      }
      const headingMap = {
        h1: () => insertTextAtSelection2(textarea, "\n# ", "", "\u4E00\u7EA7\u6807\u9898"),
        h2: () => insertTextAtSelection2(textarea, "\n## ", "", "\u4E8C\u7EA7\u6807\u9898"),
        h3: () => insertTextAtSelection2(textarea, "\n### ", "", "\u4E09\u7EA7\u6807\u9898"),
        h4: () => insertTextAtSelection2(textarea, "\n#### ", "", "\u56DB\u7EA7\u6807\u9898"),
        h5: () => insertTextAtSelection2(textarea, "\n##### ", "", "\u4E94\u7EA7\u6807\u9898"),
        h6: () => insertTextAtSelection2(textarea, "\n###### ", "", "\u516D\u7EA7\u6807\u9898")
      };
      if (action in headingMap) {
        const next2 = headingMap[action]();
        updateItem(activePage.value.id, (item) => ({ ...item, content: next2.value }));
        textarea.focus();
        textarea.setSelectionRange(next2.selectionStart, next2.selectionEnd);
        return;
      }
      const actionMap = {
        bold: () => insertTextAtSelection2(textarea, "**", "**", "\u52A0\u7C97\u6587\u672C"),
        italic: () => insertTextAtSelection2(textarea, "*", "*", "\u659C\u4F53\u6587\u672C"),
        quote: () => insertTextAtSelection2(textarea, "\n> ", "", "\u5F15\u7528\u5185\u5BB9"),
        code: () => insertTextAtSelection2(textarea, "\n```ts\n", "\n```\n", 'console.log("hello");'),
        list: () => insertTextAtSelection2(textarea, "\n- ", "", "\u5217\u8868\u9879"),
        link: () => insertTextAtSelection2(textarea, "[", "](https://example.com)", "\u94FE\u63A5\u6587\u5B57"),
        image: () => insertTextAtSelection2(textarea, "![\u56FE\u7247\u63CF\u8FF0](", ")", "\u56FE\u7247\u63CF\u8FF0")
      };
      const next = actionMap[action]();
      updateItem(activePage.value.id, (item) => ({ ...item, content: next.value }));
      textarea.focus();
      textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
    }
    function applyMediaSelection(asset) {
      var _a, _b;
      const textarea = textareaRef.value;
      if (!textarea || !activePage.value)
        return;
      const altText = ((_a = asset.altText) == null ? void 0 : _a.trim()) || ((_b = asset.title) == null ? void 0 : _b.trim()) || "\u56FE\u7247";
      const next = insertTextAtSelection2(textarea, `
![${altText}](`, `)
`, asset.url);
      updateItem(activePage.value.id, (item) => ({ ...item, content: next.value }));
      textarea.focus();
      textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
      mediaPickerOpen.value = false;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_MarkdownToolbar = resolveComponent("MarkdownToolbar");
      const _component_MarkdownPreview = resolveComponent("MarkdownPreview");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(externalImageDialogOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-lg overflow-hidden shadow-2xl"><div class="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">\u5916\u94FE\u56FE\u7247</p><h3 class="mt-1 text-xl font-semibold text-slate-900">\u63D2\u5165\u5916\u94FE\u56FE\u7247</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">\u56FE\u7247\u94FE\u63A5</span><input${ssrRenderAttr("value", unref(externalImageUrl))} class="admin-input" placeholder="https://example.com/image.jpg"></label><div class="flex flex-col gap-3 sm:flex-row sm:justify-end"><button class="admin-button-secondary" type="button"> \u53D6\u6D88 </button><button class="admin-button-primary" type="button"> \u63D2\u5165\u5916\u94FE\u56FE\u7247 </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(tableDialogOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-lg overflow-hidden shadow-2xl"><div class="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Table</p><h3 class="mt-1 text-xl font-semibold text-slate-900">\u63D2\u5165\u8868\u683C</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">\u8868\u683C\u884C\u6570</span><input${ssrRenderAttr("value", unref(tableRowCount))} class="admin-input" type="number" min="1"></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">\u8868\u683C\u5217\u6570</span><input${ssrRenderAttr("value", unref(tableColumnCount))} class="admin-input" type="number" min="1"></label></div><div class="flex flex-col gap-3 sm:flex-row sm:justify-end"><button class="admin-button-secondary" type="button"> \u53D6\u6D88 </button><button class="admin-button-primary" type="button"> \u63D2\u5165\u8868\u683C </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u72EC\u7ACB\u9875",
        description: "\u7BA1\u7406\u7AD9\u70B9\u4E2D\u7684\u81EA\u5B9A\u4E49\u72EC\u7ACB\u9875\u9762\u3002\u4FDD\u5B58\u540E\u53EF\u901A\u8FC7 /pages/slug \u8BBF\u95EE\uFF0C\u4E5F\u53EF\u4EE5\u624B\u52A8\u52A0\u5165\u5BFC\u822A\u83DC\u5355\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b;
          if (_push2) {
            if ((_a = unref(activePage)) == null ? void 0 : _a.slug) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/pages/${unref(activePage).slug}`,
                target: "_blank",
                class: "admin-button-secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"${_scopeId2}></path></svg> \u9884\u89C8\u9875\u9762 `);
                  } else {
                    return [
                      (openBlock(), createBlock("svg", {
                        class: "h-4 w-4",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24"
                      }, [
                        createVNode("path", {
                          "stroke-linecap": "round",
                          "stroke-linejoin": "round",
                          "stroke-width": "2",
                          d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        })
                      ])),
                      createTextVNode(" \u9884\u89C8\u9875\u9762 ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}${_scopeId}><svg class="${ssrRenderClass([{ "animate-spin": unref(loading) }, "h-4 w-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"${_scopeId}></path></svg> \u5237\u65B0 </button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"${_scopeId}></path></svg> \u4FDD\u5B58\u72EC\u7ACB\u9875 </button>`);
          } else {
            return [
              ((_b = unref(activePage)) == null ? void 0 : _b.slug) ? (openBlock(), createBlock(_component_NuxtLink, {
                key: 0,
                to: `/pages/${unref(activePage).slug}`,
                target: "_blank",
                class: "admin-button-secondary"
              }, {
                default: withCtx(() => [
                  (openBlock(), createBlock("svg", {
                    class: "h-4 w-4",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    })
                  ])),
                  createTextVNode(" \u9884\u89C8\u9875\u9762 ")
                ]),
                _: 1
              }, 8, ["to"])) : createCommentVNode("", true),
              createVNode("button", {
                class: "admin-button-secondary",
                disabled: unref(loading),
                onClick: unref(loadPages)
              }, [
                (openBlock(), createBlock("svg", {
                  class: ["h-4 w-4", { "animate-spin": unref(loading) }],
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  })
                ], 2)),
                createTextVNode(" \u5237\u65B0 ")
              ], 8, ["disabled", "onClick"]),
              createVNode("button", {
                class: "admin-button-primary",
                disabled: unref(saving),
                onClick: unref(savePages)
              }, [
                (openBlock(), createBlock("svg", {
                  class: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  })
                ])),
                createTextVNode(" \u4FDD\u5B58\u72EC\u7ACB\u9875 ")
              ], 8, ["disabled", "onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">${ssrInterpolate(unref(successMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u72EC\u7ACB\u9875... </div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading)) {
        _push(`<section class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"><aside class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><h3 class="text-base font-semibold text-slate-900">\u9875\u9762\u5217\u8868</h3><p class="text-sm text-slate-500">\u652F\u6301\u6392\u5E8F\u3001\u542F\u7528\u548C\u5220\u9664\u3002</p></div><button class="admin-button-secondary" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> \u65B0\u5EFA </button></div><div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
        ssrRenderList(unref(items), (item, index) => {
          var _a;
          _push(`<button class="${ssrRenderClass([item.id === ((_a = unref(activePage)) == null ? void 0 : _a.id) ? "bg-blue-50" : "hover:bg-slate-50/70", "w-full px-5 py-4 text-left transition"])}" type="button"><div class="flex items-start gap-3"><div class="mt-0.5 flex flex-col gap-1"><button${ssrIncludeBooleanAttr(index === 0) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="\u4E0A\u79FB" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button><button${ssrIncludeBooleanAttr(index === unref(items).length - 1) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="\u4E0B\u79FB" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="truncate font-medium text-slate-900">${ssrInterpolate(item.title.trim() || `\u672A\u547D\u540D\u9875\u9762 ${index + 1}`)}</span><span class="${ssrRenderClass([item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500", "rounded-full px-2 py-0.5 text-[11px] font-semibold"])}">${ssrInterpolate(item.enabled ? "\u542F\u7528" : "\u505C\u7528")}</span></div><p class="mt-1 truncate text-xs text-slate-500">${ssrInterpolate(item.slug ? `/pages/${item.slug}` : "\u8FD8\u6CA1\u6709 slug")}</p><p class="mt-2 line-clamp-2 text-sm text-slate-600">${ssrInterpolate(item.summary.trim() || "\u586B\u5199\u9875\u9762\u6458\u8981\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u7B80\u4ECB\u3002")}</p></div><button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="\u5220\u9664" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></button>`);
        });
        _push(`<!--]--></div></aside>`);
        if (unref(activePage)) {
          _push(`<div class="space-y-6"><section class="admin-card p-6"><div class="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><strong>\u63D0\u793A\uFF1A</strong>\u6807\u9898\u3001Slug\u3001\u6458\u8981\u548C\u5185\u5BB9\u90FD\u662F\u5FC5\u586B\u9879\uFF0C\u8BF7\u5B8C\u6574\u586B\u5199\u540E\u518D\u4FDD\u5B58\u3002 </div><div class="grid gap-4 md:grid-cols-2"><div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"> \u9875\u9762\u6807\u9898 <span class="text-rose-500">*</span></label><input${ssrRenderAttr("value", unref(activePage).title)} class="admin-input" placeholder="\u4F8B\u5982\uFF1A\u5173\u4E8E\u672C\u7AD9"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700"> \u9875\u9762 Slug <span class="text-rose-500">*</span></label><div class="flex gap-3"><input${ssrRenderAttr("value", unref(activePage).slug)} class="admin-input" placeholder="about-site"><button class="admin-button-secondary shrink-0" type="button"> \u751F\u6210 </button></div></div><div class="flex items-end"><label class="flex items-center gap-3"><button class="${ssrRenderClass(unref(activePage).enabled ? "admin-switch admin-switch-on" : "admin-switch")}" type="button"><span class="admin-switch-thumb"></span></button><span class="text-sm font-medium text-slate-700">\u524D\u53F0\u53EF\u89C1</span></label></div><div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"> \u9875\u9762\u6458\u8981 <span class="text-rose-500">*</span></label><textarea class="admin-textarea min-h-24" placeholder="\u7528\u4E8E\u9875\u9762\u9876\u90E8\u7B80\u4ECB\uFF0C\u4E5F\u65B9\u4FBF\u540E\u53F0\u5217\u8868\u5FEB\u901F\u8BC6\u522B\u3002">${ssrInterpolate(unref(activePage).summary)}</textarea></div></div></section><div class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between border-b border-[var(--admin-border)] bg-amber-50/50 px-5 py-3"><div class="flex items-center gap-2"><span class="text-sm font-medium text-slate-900">\u9875\u9762\u5185\u5BB9</span><span class="text-rose-500">*</span></div><span class="text-xs text-slate-500">\u5FC5\u586B\u9879\uFF0C\u4F7F\u7528 Markdown \u7F16\u5199</span></div><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-slate-50/90 px-4 py-3">`);
          _push(ssrRenderComponent(_component_MarkdownToolbar, {
            disabled: unref(saving),
            onAction: handleToolbarAction,
            onImageUpload: ($event) => mediaPickerOpen.value = true,
            onExternalImageInsert: ($event) => externalImageDialogOpen.value = true
          }, null, _parent));
          _push(`<div class="flex gap-2"><button class="${ssrRenderClass(unref(viewMode) === "edit" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> \u7F16\u8F91 </button><button class="${ssrRenderClass(unref(viewMode) === "split" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg> \u5206\u680F </button><button class="${ssrRenderClass(unref(viewMode) === "preview" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> \u9884\u89C8 </button></div></div><div class="${ssrRenderClass(["grid min-h-[720px]", unref(viewMode) === "split" ? "lg:grid-cols-2" : "grid-cols-1"])}">`);
          if (unref(viewMode) !== "preview") {
            _push(`<div class="${ssrRenderClass([unref(viewMode) === "split" ? "" : "border-r-0", "border-r border-[var(--admin-border)]"])}"><textarea class="admin-editor-textarea" placeholder="\u4F7F\u7528 Markdown \u7F16\u5199\u9875\u9762\u5185\u5BB9...">${ssrInterpolate(unref(activePage).content)}</textarea></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(viewMode) !== "edit") {
            _push(`<div class="${ssrRenderClass(unref(viewMode) === "preview" ? "" : "bg-white")}">`);
            _push(ssrRenderComponent(_component_MarkdownPreview, {
              value: unref(activePage).content || "## \u5F00\u59CB\u7F16\u8F91\n\n\u53F3\u4FA7\u4F1A\u663E\u793A\u5B9E\u65F6\u9884\u89C8\u3002"
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><section class="admin-card p-5"><div class="flex items-start gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div><div class="space-y-2 text-sm text-slate-600"><p>\u5F53\u524D\u8BBF\u95EE\u5730\u5740\uFF1A${ssrInterpolate(unref(activePage).slug ? `/pages/${unref(activePage).slug}` : "\u8BF7\u5148\u586B\u5199 slug")}</p><p>\u5982\u679C\u4F60\u5E0C\u671B\u5B83\u51FA\u73B0\u5728\u524D\u53F0\u9876\u90E8\u83DC\u5355\uFF0C\u53EF\u4EE5\u5230&quot;\u5206\u7C7B\u8BBE\u7F6E&quot;\u91CC\u7684\u5BFC\u822A\u83DC\u5355\u4E2D\u624B\u52A8\u65B0\u589E\u5BF9\u5E94\u94FE\u63A5\u3002</p></div></div></section></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$2, {
        open: unref(mediaPickerOpen),
        title: "\u9009\u62E9\u56FE\u7247",
        "empty-message": "\u6682\u65E0\u53EF\u9009\u56FE\u7247\uFF0C\u8BF7\u5148\u4E0A\u4F20\u4E00\u5F20\u3002",
        "search-placeholder": "\u641C\u7D22\u5A92\u4F53\u5E93\u56FE\u7247",
        "upload-usage": "article_content",
        onClose: ($event) => mediaPickerOpen.value = false,
        onSelect: applyMediaSelection
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/pages.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=pages-zcunjHbX.mjs.map
