import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { ref, computed, defineComponent, resolveComponent, mergeProps, unref, withCtx, openBlock, createBlock, createVNode, createTextVNode, createCommentVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderTeleport, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _sfc_main$2 } from "./MediaPickerDialog-CKbzUmQT.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import { b as buildMarkdownTable, i as insertTextAtSelection, s as sanitizeArticleSlug } from "./admin-editor-CUf6Pf5Q.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./admin-media-DKXf4jjq.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "./api-base-COxdl8qP.js";
function useAdminStandalonePages() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const activeId = ref(null);
  const activePage = computed(
    () => items.value.find((item) => item.id === activeId.value) ?? items.value[0] ?? null
  );
  function showMessage(msg, isError = false) {
    if (isError) {
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
    loading.value = true;
    error.value = "";
    try {
      const result = await adminApiFetch("/api/v1/admin/site-settings/standalone-pages");
      const nextItems = result.length > 0 ? result : [makePage()];
      items.value = nextItems;
      activeId.value = activeId.value ?? nextItems[0]?.id ?? null;
      showMessage("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "加载独立页失败", true);
    } finally {
      loading.value = false;
    }
  }
  async function savePages() {
    const validItems = items.value.filter(
      (item) => item.title.trim() && item.slug.trim() && item.summary.trim() && item.content.trim()
    );
    if (validItems.length === 0) {
      showMessage("请至少完整填写一个独立页（标题、Slug、摘要、内容）", true);
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
      activeId.value = nextItems.find((item) => item.id === activeId.value)?.id ?? nextItems[0]?.id ?? null;
      showMessage("独立页已保存");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "保存失败", true);
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
      title: "独立页面"
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
        h1: () => insertTextAtSelection2(textarea, "\n# ", "", "一级标题"),
        h2: () => insertTextAtSelection2(textarea, "\n## ", "", "二级标题"),
        h3: () => insertTextAtSelection2(textarea, "\n### ", "", "三级标题"),
        h4: () => insertTextAtSelection2(textarea, "\n#### ", "", "四级标题"),
        h5: () => insertTextAtSelection2(textarea, "\n##### ", "", "五级标题"),
        h6: () => insertTextAtSelection2(textarea, "\n###### ", "", "六级标题")
      };
      if (action in headingMap) {
        const next2 = headingMap[action]();
        updateItem(activePage.value.id, (item) => ({ ...item, content: next2.value }));
        textarea.focus();
        textarea.setSelectionRange(next2.selectionStart, next2.selectionEnd);
        return;
      }
      const actionMap = {
        bold: () => insertTextAtSelection2(textarea, "**", "**", "加粗文本"),
        italic: () => insertTextAtSelection2(textarea, "*", "*", "斜体文本"),
        quote: () => insertTextAtSelection2(textarea, "\n> ", "", "引用内容"),
        code: () => insertTextAtSelection2(textarea, "\n```ts\n", "\n```\n", 'console.log("hello");'),
        list: () => insertTextAtSelection2(textarea, "\n- ", "", "列表项"),
        link: () => insertTextAtSelection2(textarea, "[", "](https://example.com)", "链接文字"),
        image: () => insertTextAtSelection2(textarea, "![图片描述](", ")", "图片描述")
      };
      const next = actionMap[action]();
      updateItem(activePage.value.id, (item) => ({ ...item, content: next.value }));
      textarea.focus();
      textarea.setSelectionRange(next.selectionStart, next.selectionEnd);
    }
    function applyMediaSelection(asset) {
      const textarea = textareaRef.value;
      if (!textarea || !activePage.value)
        return;
      const altText = asset.altText?.trim() || asset.title?.trim() || "图片";
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
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-lg overflow-hidden shadow-2xl"><div class="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">外链图片</p><h3 class="mt-1 text-xl font-semibold text-slate-900">插入外链图片</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">图片链接</span><input${ssrRenderAttr("value", unref(externalImageUrl))} class="admin-input" placeholder="https://example.com/image.jpg"></label><div class="flex flex-col gap-3 sm:flex-row sm:justify-end"><button class="admin-button-secondary" type="button"> 取消 </button><button class="admin-button-primary" type="button"> 插入外链图片 </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(tableDialogOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-lg overflow-hidden shadow-2xl"><div class="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Table</p><h3 class="mt-1 text-xl font-semibold text-slate-900">插入表格</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><div class="grid gap-4 sm:grid-cols-2"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">表格行数</span><input${ssrRenderAttr("value", unref(tableRowCount))} class="admin-input" type="number" min="1"></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">表格列数</span><input${ssrRenderAttr("value", unref(tableColumnCount))} class="admin-input" type="number" min="1"></label></div><div class="flex flex-col gap-3 sm:flex-row sm:justify-end"><button class="admin-button-secondary" type="button"> 取消 </button><button class="admin-button-primary" type="button"> 插入表格 </button></div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "独立页",
        description: "管理站点中的自定义独立页面。保存后可通过 /pages/slug 访问，也可以手动加入导航菜单。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (unref(activePage)?.slug) {
              _push2(ssrRenderComponent(_component_NuxtLink, {
                to: `/pages/${unref(activePage).slug}`,
                target: "_blank",
                class: "admin-button-secondary"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"${_scopeId2}></path></svg> 预览页面 `);
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
                      createTextVNode(" 预览页面 ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              _push2(`<!---->`);
            }
            _push2(`<button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}${_scopeId}><svg class="${ssrRenderClass([{ "animate-spin": unref(loading) }, "h-4 w-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"${_scopeId}></path></svg> 刷新 </button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"${_scopeId}></path></svg> 保存独立页 </button>`);
          } else {
            return [
              unref(activePage)?.slug ? (openBlock(), createBlock(_component_NuxtLink, {
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
                  createTextVNode(" 预览页面 ")
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
                createTextVNode(" 刷新 ")
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
                createTextVNode(" 保存独立页 ")
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
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> 正在加载独立页... </div>`);
      } else {
        _push(`<!---->`);
      }
      if (!unref(loading)) {
        _push(`<section class="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]"><aside class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><h3 class="text-base font-semibold text-slate-900">页面列表</h3><p class="text-sm text-slate-500">支持排序、启用和删除。</p></div><button class="admin-button-secondary" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> 新建 </button></div><div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
        ssrRenderList(unref(items), (item, index) => {
          _push(`<button class="${ssrRenderClass([item.id === unref(activePage)?.id ? "bg-blue-50" : "hover:bg-slate-50/70", "w-full px-5 py-4 text-left transition"])}" type="button"><div class="flex items-start gap-3"><div class="mt-0.5 flex flex-col gap-1"><button${ssrIncludeBooleanAttr(index === 0) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="上移" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button><button${ssrIncludeBooleanAttr(index === unref(items).length - 1) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="下移" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div><div class="min-w-0 flex-1"><div class="flex items-center gap-2"><span class="truncate font-medium text-slate-900">${ssrInterpolate(item.title.trim() || `未命名页面 ${index + 1}`)}</span><span class="${ssrRenderClass([item.enabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500", "rounded-full px-2 py-0.5 text-[11px] font-semibold"])}">${ssrInterpolate(item.enabled ? "启用" : "停用")}</span></div><p class="mt-1 truncate text-xs text-slate-500">${ssrInterpolate(item.slug ? `/pages/${item.slug}` : "还没有 slug")}</p><p class="mt-2 line-clamp-2 text-sm text-slate-600">${ssrInterpolate(item.summary.trim() || "填写页面摘要后，这里会显示简介。")}</p></div><button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="删除" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></button>`);
        });
        _push(`<!--]--></div></aside>`);
        if (unref(activePage)) {
          _push(`<div class="space-y-6"><section class="admin-card p-6"><div class="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"><strong>提示：</strong>标题、Slug、摘要和内容都是必填项，请完整填写后再保存。 </div><div class="grid gap-4 md:grid-cols-2"><div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"> 页面标题 <span class="text-rose-500">*</span></label><input${ssrRenderAttr("value", unref(activePage).title)} class="admin-input" placeholder="例如：关于本站"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700"> 页面 Slug <span class="text-rose-500">*</span></label><div class="flex gap-3"><input${ssrRenderAttr("value", unref(activePage).slug)} class="admin-input" placeholder="about-site"><button class="admin-button-secondary shrink-0" type="button"> 生成 </button></div></div><div class="flex items-end"><label class="flex items-center gap-3"><button class="${ssrRenderClass(unref(activePage).enabled ? "admin-switch admin-switch-on" : "admin-switch")}" type="button"><span class="admin-switch-thumb"></span></button><span class="text-sm font-medium text-slate-700">前台可见</span></label></div><div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700"> 页面摘要 <span class="text-rose-500">*</span></label><textarea class="admin-textarea min-h-24" placeholder="用于页面顶部简介，也方便后台列表快速识别。">${ssrInterpolate(unref(activePage).summary)}</textarea></div></div></section><div class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between border-b border-[var(--admin-border)] bg-amber-50/50 px-5 py-3"><div class="flex items-center gap-2"><span class="text-sm font-medium text-slate-900">页面内容</span><span class="text-rose-500">*</span></div><span class="text-xs text-slate-500">必填项，使用 Markdown 编写</span></div><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] bg-slate-50/90 px-4 py-3">`);
          _push(ssrRenderComponent(_component_MarkdownToolbar, {
            disabled: unref(saving),
            onAction: handleToolbarAction,
            onImageUpload: ($event) => mediaPickerOpen.value = true,
            onExternalImageInsert: ($event) => externalImageDialogOpen.value = true
          }, null, _parent));
          _push(`<div class="flex gap-2"><button class="${ssrRenderClass(unref(viewMode) === "edit" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg> 编辑 </button><button class="${ssrRenderClass(unref(viewMode) === "split" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path></svg> 分栏 </button><button class="${ssrRenderClass(unref(viewMode) === "preview" ? "admin-button-primary" : "admin-button-secondary")}" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 预览 </button></div></div><div class="${ssrRenderClass(["grid min-h-[720px]", unref(viewMode) === "split" ? "lg:grid-cols-2" : "grid-cols-1"])}">`);
          if (unref(viewMode) !== "preview") {
            _push(`<div class="${ssrRenderClass([unref(viewMode) === "split" ? "" : "border-r-0", "border-r border-[var(--admin-border)]"])}"><textarea class="admin-editor-textarea" placeholder="使用 Markdown 编写页面内容...">${ssrInterpolate(unref(activePage).content)}</textarea></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(viewMode) !== "edit") {
            _push(`<div class="${ssrRenderClass(unref(viewMode) === "preview" ? "" : "bg-white")}">`);
            _push(ssrRenderComponent(_component_MarkdownPreview, {
              value: unref(activePage).content || "## 开始编辑\n\n右侧会显示实时预览。"
            }, null, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><section class="admin-card p-5"><div class="flex items-start gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div><div class="space-y-2 text-sm text-slate-600"><p>当前访问地址：${ssrInterpolate(unref(activePage).slug ? `/pages/${unref(activePage).slug}` : "请先填写 slug")}</p><p>如果你希望它出现在前台顶部菜单，可以到&quot;分类设置&quot;里的导航菜单中手动新增对应链接。</p></div></div></section></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$2, {
        open: unref(mediaPickerOpen),
        title: "选择图片",
        "empty-message": "暂无可选图片，请先上传一张。",
        "search-placeholder": "搜索媒体库图片",
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
export {
  _sfc_main as default
};
//# sourceMappingURL=pages-zcunjHbX.js.map
