import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { defineComponent, ref, mergeProps, withCtx, unref, createVNode, openBlock, createBlock, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './api-base-COxdl8qP.mjs';

function useAdminContent() {
  const { adminApiFetch } = useAdminSession();
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const navigationItems = ref([]);
  const categories = ref([]);
  const tags = ref([]);
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
  async function loadAll() {
    loading.value = true;
    error.value = "";
    try {
      const [nav, cats, ts] = await Promise.all([
        adminApiFetch("/api/v1/admin/site-settings/navigation"),
        adminApiFetch("/api/v1/admin/articles/meta/categories"),
        adminApiFetch("/api/v1/admin/articles/meta/tags")
      ]);
      navigationItems.value = nav.length > 0 ? nav : [makeNavItem()];
      categories.value = cats;
      tags.value = ts;
      showMessage("");
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u52A0\u8F7D\u6570\u636E\u5931\u8D25";
    } finally {
      loading.value = false;
    }
  }
  function makeNavItem() {
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `nav-${Date.now()}`,
      label: "",
      href: "",
      sortOrder: 0,
      enabled: true
    };
  }
  function makeCategory() {
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cat-${Date.now()}`,
      name: "",
      slug: "",
      description: "",
      isEnabled: true,
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  function makeTag() {
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `tag-${Date.now()}`,
      name: "",
      slug: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-+|-+$/g, "").replace(/-+/g, "-").substring(0, 120);
  }
  async function saveNavigation() {
    saving.value = true;
    try {
      const payload = navigationItems.value.filter((item) => item.label.trim() && item.href.trim()).map((item, index) => {
        var _a;
        return {
          id: item.id,
          label: item.label.trim(),
          href: item.href.trim(),
          iconUrl: (_a = item.iconUrl) != null ? _a : null,
          sortOrder: index,
          enabled: item.enabled
        };
      });
      const result = await adminApiFetch("/api/v1/admin/site-settings/navigation", {
        method: "PUT",
        body: JSON.stringify({ items: payload })
      });
      navigationItems.value = result;
      showMessage("\u83DC\u5355\u5DF2\u4FDD\u5B58");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u4FDD\u5B58\u83DC\u5355\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  function moveNavItem(index, direction) {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= navigationItems.value.length)
      return;
    const items = [...navigationItems.value];
    [items[index], items[newIndex]] = [items[newIndex], items[index]];
    navigationItems.value = items;
  }
  async function addCategory(input) {
    if (!input.name.trim() || !input.slug.trim() || !input.description.trim()) {
      showMessage("\u8BF7\u8865\u5168\u5206\u7C7B\u540D\u79F0\u3001\u522B\u540D\u548C\u63CF\u8FF0", true);
      return;
    }
    saving.value = true;
    try {
      const created = await adminApiFetch("/api/v1/admin/articles/meta/categories", {
        method: "POST",
        body: JSON.stringify(input)
      });
      categories.value = [...categories.value, created].sort((a, b) => a.name.localeCompare(b.name));
      showMessage("\u5206\u7C7B\u5DF2\u521B\u5EFA");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u521B\u5EFA\u5206\u7C7B\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  async function updateCategory(categoryId, input) {
    saving.value = true;
    try {
      const result = await adminApiFetch(
        `/api/v1/admin/articles/meta/categories/${categoryId}`,
        {
          method: "PATCH",
          body: JSON.stringify(input)
        }
      );
      categories.value = categories.value.map((row) => row.id === result.id ? result : row).sort((a, b) => a.name.localeCompare(b.name));
      showMessage("\u5206\u7C7B\u5DF2\u66F4\u65B0");
      return result;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u66F4\u65B0\u5206\u7C7B\u5931\u8D25", true);
      return null;
    } finally {
      saving.value = false;
    }
  }
  async function deleteCategory(categoryId) {
    if (!confirm("\u786E\u5B9A\u8981\u5220\u9664\u6B64\u5206\u7C7B\u5417\uFF1F"))
      return;
    saving.value = true;
    try {
      await adminApiFetch(`/api/v1/admin/articles/meta/categories/${categoryId}`, {
        method: "DELETE"
      });
      categories.value = categories.value.filter((item) => item.id !== categoryId);
      showMessage("\u5206\u7C7B\u5DF2\u5220\u9664");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u5220\u9664\u5206\u7C7B\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  async function addTag(input) {
    if (!input.name.trim() || !input.slug.trim()) {
      showMessage("\u8BF7\u8865\u5168\u6807\u7B7E\u540D\u79F0\u548C\u522B\u540D", true);
      return;
    }
    saving.value = true;
    try {
      const created = await adminApiFetch("/api/v1/admin/articles/meta/tags", {
        method: "POST",
        body: JSON.stringify(input)
      });
      tags.value = [...tags.value, created].sort((a, b) => a.name.localeCompare(b.name));
      showMessage("\u6807\u7B7E\u5DF2\u521B\u5EFA");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u521B\u5EFA\u6807\u7B7E\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  async function updateTag(tagId, input) {
    saving.value = true;
    try {
      const result = await adminApiFetch(
        `/api/v1/admin/articles/meta/tags/${tagId}`,
        {
          method: "PATCH",
          body: JSON.stringify(input)
        }
      );
      tags.value = tags.value.map((row) => row.id === result.id ? result : row).sort((a, b) => a.name.localeCompare(b.name));
      showMessage("\u6807\u7B7E\u5DF2\u66F4\u65B0");
      return result;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u66F4\u65B0\u6807\u7B7E\u5931\u8D25", true);
      return null;
    } finally {
      saving.value = false;
    }
  }
  async function deleteTag(tagId) {
    if (!confirm("\u786E\u5B9A\u8981\u5220\u9664\u6B64\u6807\u7B7E\u5417\uFF1F"))
      return;
    saving.value = true;
    try {
      await adminApiFetch(`/api/v1/admin/articles/meta/tags/${tagId}`, {
        method: "DELETE"
      });
      tags.value = tags.value.filter((item) => item.id !== tagId);
      showMessage("\u6807\u7B7E\u5DF2\u5220\u9664");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u5220\u9664\u6807\u7B7E\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  return {
    // 状态
    loading,
    saving,
    error,
    successMessage,
    navigationItems,
    categories,
    tags,
    // 工具函数
    makeNavItem,
    makeCategory,
    makeTag,
    slugify,
    // 方法
    loadAll,
    saveNavigation,
    moveNavItem,
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "content",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u5185\u5BB9\u7BA1\u7406"
    });
    const {
      loading,
      saving,
      error,
      successMessage,
      navigationItems,
      categories,
      tags,
      loadAll
    } = useAdminContent();
    const activeTab = ref("navigation");
    const newCategory = ref({
      name: "",
      slug: "",
      description: "",
      isEnabled: true
    });
    const newTag = ref({
      name: "",
      slug: ""
    });
    const editingCategoryId = ref(null);
    const editingTagId = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u5185\u5BB9\u7BA1\u7406",
        description: "\u7BA1\u7406\u9876\u90E8\u83DC\u5355\u3001\u5206\u7C7B\u548C\u6807\u7B7E"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}${_scopeId}><svg class="${ssrRenderClass([{ "animate-spin": unref(loading) }, "h-4 w-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"${_scopeId}></path></svg> \u5237\u65B0 </button>`);
          } else {
            return [
              createVNode("button", {
                class: "admin-button-secondary",
                disabled: unref(loading),
                onClick: unref(loadAll)
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
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> \u52A0\u8F7D\u4E2D... </div>`);
      } else {
        _push(`<div class="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]"><aside class="admin-card p-3"><div class="space-y-1"><button class="${ssrRenderClass([unref(activeTab) === "navigation" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50", "flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"])}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg><span class="font-medium">\u83DC\u5355\u8BBE\u7F6E</span></button><button class="${ssrRenderClass([unref(activeTab) === "categories" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50", "flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"])}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg><span class="font-medium">\u5206\u7C7B\u8BBE\u7F6E</span></button><button class="${ssrRenderClass([unref(activeTab) === "tags" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50", "flex w-full items-center gap-3 rounded-[4px] px-4 py-3 text-left text-sm transition"])}"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg><span class="font-medium">\u6807\u7B7E\u8BBE\u7F6E</span></button></div></aside><div class="space-y-6">`);
        if (unref(activeTab) === "navigation") {
          _push(`<div class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><h3 class="text-base font-semibold text-slate-900">\u83DC\u5355\u9879\u5217\u8868</h3><p class="text-sm text-slate-500">\u62D6\u52A8\u6392\u5E8F\uFF0C\u7F16\u8F91\u9876\u90E8\u5BFC\u822A\u680F\u663E\u793A\u7684\u83DC\u5355\u9879</p></div><div class="flex gap-3"><button class="admin-button-secondary" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> \u6DFB\u52A0\u83DC\u5355\u9879 </button><button class="admin-button-primary" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> \u4FDD\u5B58\u83DC\u5355 </button></div></div>`);
          if (unref(navigationItems).length === 0) {
            _push(`<div class="px-5 py-12 text-center text-sm text-slate-500"> \u6682\u65E0\u83DC\u5355\u9879\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u6DFB\u52A0 </div>`);
          } else {
            _push(`<div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
            ssrRenderList(unref(navigationItems), (item, index) => {
              _push(`<div class="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/50"><div class="flex flex-col gap-1"><button type="button"${ssrIncludeBooleanAttr(index === 0) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="\u4E0A\u79FB"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button><button type="button"${ssrIncludeBooleanAttr(index === unref(navigationItems).length - 1) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="\u4E0B\u79FB"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div><div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">${ssrInterpolate(index + 1)}</div><div class="grid flex-1 gap-3 md:grid-cols-[1fr_1.5fr_auto]"><input${ssrRenderAttr("value", item.label)} class="admin-input" placeholder="\u83DC\u5355\u540D\u79F0"><input${ssrRenderAttr("value", item.href)} class="admin-input" placeholder="\u94FE\u63A5\u5730\u5740\uFF08\u5982\uFF1A/articles\uFF09"><div class="flex items-center gap-3"><button type="button" class="${ssrRenderClass([{ "admin-switch-on": item.enabled }, "admin-switch"])}"${ssrRenderAttr("title", item.enabled ? "\u70B9\u51FB\u7981\u7528" : "\u70B9\u51FB\u542F\u7528")}><span class="admin-switch-thumb"></span></button><button type="button" class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="\u5220\u9664"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "categories") {
          _push(`<div class="space-y-6"><div class="admin-card p-5"><div class="mb-4"><h3 class="text-base font-semibold text-slate-900">\u5FEB\u901F\u6DFB\u52A0\u5206\u7C7B</h3><p class="text-sm text-slate-500">\u586B\u5199\u4EE5\u4E0B\u4FE1\u606F\u521B\u5EFA\u65B0\u5206\u7C7B</p></div><div class="grid gap-4 md:grid-cols-[1fr_1fr_2fr_auto]"><div><label class="mb-1.5 block text-xs font-medium text-slate-700">\u5206\u7C7B\u540D\u79F0 *</label><input${ssrRenderAttr("value", unref(newCategory).name)} class="admin-input" placeholder="\u5982\uFF1A\u6280\u672F\u535A\u5BA2"></div><div><label class="mb-1.5 block text-xs font-medium text-slate-700">\u522B\u540D (Slug) *</label><input${ssrRenderAttr("value", unref(newCategory).slug)} class="admin-input" placeholder="\u5982\uFF1Atechblog \u6216 tech-blog"><p class="mt-1 text-xs text-slate-500">\u53EA\u80FD\u5305\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\uFF0C\u8FDE\u5B57\u7B26\u53EF\u9009</p></div><div><label class="mb-1.5 block text-xs font-medium text-slate-700">\u63CF\u8FF0 *</label><input${ssrRenderAttr("value", unref(newCategory).description)} class="admin-input" placeholder="\u5206\u7C7B\u7B80\u4ECB\u8BF4\u660E"></div><div class="flex items-end gap-3"><label class="flex items-center gap-2 pb-1"><button type="button" class="${ssrRenderClass([{ "admin-switch-on": unref(newCategory).isEnabled }, "admin-switch"])}"><span class="admin-switch-thumb"></span></button><span class="text-xs font-medium text-slate-700">\u542F\u7528</span></label><button class="admin-button-primary" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> \u6DFB\u52A0\u5206\u7C7B </button></div></div></div><div class="admin-card overflow-hidden p-0"><div class="border-b border-[var(--admin-border)] px-5 py-4"><h3 class="text-base font-semibold text-slate-900">\u5DF2\u6709\u5206\u7C7B</h3><p class="text-sm text-slate-500">\u5171 ${ssrInterpolate(unref(categories).length)} \u4E2A\u5206\u7C7B</p></div>`);
          if (unref(categories).length === 0) {
            _push(`<div class="px-5 py-12 text-center text-sm text-slate-500"> \u6682\u65E0\u5206\u7C7B\uFF0C\u8BF7\u5728\u4E0A\u65B9\u6DFB\u52A0 </div>`);
          } else {
            _push(`<div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
            ssrRenderList(unref(categories), (item) => {
              _push(`<div class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50">`);
              if (unref(editingCategoryId) === item.id) {
                _push(`<!--[--><div class="grid flex-1 gap-3 md:grid-cols-[1fr_1fr_2fr]"><input${ssrRenderAttr("value", item.name)} class="admin-input" placeholder="\u5206\u7C7B\u540D\u79F0"><input${ssrRenderAttr("value", item.slug)} class="admin-input" placeholder="\u522B\u540D"><input${ssrRenderAttr("value", item.description)} class="admin-input" placeholder="\u63CF\u8FF0"></div><div class="flex items-center gap-2"><button type="button" class="${ssrRenderClass([{ "admin-switch-on": item.isEnabled }, "admin-switch"])}"><span class="admin-switch-thumb"></span></button><button class="rounded-lg p-2 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600" type="button" title="\u4FDD\u5B58"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg></button><button class="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600" type="button" title="\u53D6\u6D88"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><!--]-->`);
              } else {
                _push(`<!--[--><div class="flex-1"><div class="flex items-center gap-3"><h4 class="font-medium text-slate-900">${ssrInterpolate(item.name)}</h4><span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">${ssrInterpolate(item.slug)}</span>`);
                if (item.isEnabled) {
                  _push(`<span class="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"> \u5DF2\u542F\u7528 </span>`);
                } else {
                  _push(`<span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500"> \u5DF2\u7981\u7528 </span>`);
                }
                _push(`</div><p class="mt-1 text-sm text-slate-500">${ssrInterpolate(item.description)}</p></div><div class="flex items-center gap-2"><button class="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" type="button" title="\u7F16\u8F91"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button><button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" type="button" title="\u5220\u9664"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div><!--]-->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "tags") {
          _push(`<div class="space-y-6"><div class="admin-card p-5"><div class="mb-4"><h3 class="text-base font-semibold text-slate-900">\u5FEB\u901F\u6DFB\u52A0\u6807\u7B7E</h3><p class="text-sm text-slate-500">\u586B\u5199\u4EE5\u4E0B\u4FE1\u606F\u521B\u5EFA\u65B0\u6807\u7B7E</p></div><div class="grid gap-4 md:grid-cols-[1fr_1fr_auto]"><div><label class="mb-1.5 block text-xs font-medium text-slate-700">\u6807\u7B7E\u540D\u79F0 *</label><input${ssrRenderAttr("value", unref(newTag).name)} class="admin-input" placeholder="\u5982\uFF1AReact"></div><div><label class="mb-1.5 block text-xs font-medium text-slate-700">\u522B\u540D (Slug) *</label><input${ssrRenderAttr("value", unref(newTag).slug)} class="admin-input" placeholder="\u5982\uFF1Areact \u6216 react-hook"><p class="mt-1 text-xs text-slate-500">\u53EA\u80FD\u5305\u542B\u5C0F\u5199\u5B57\u6BCD\u3001\u6570\u5B57\uFF0C\u8FDE\u5B57\u7B26\u53EF\u9009</p></div><div class="flex items-end"><button class="admin-button-primary" type="button"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> \u6DFB\u52A0\u6807\u7B7E </button></div></div></div><div class="admin-card overflow-hidden p-0"><div class="border-b border-[var(--admin-border)] px-5 py-4"><h3 class="text-base font-semibold text-slate-900">\u5DF2\u6709\u6807\u7B7E</h3><p class="text-sm text-slate-500">\u5171 ${ssrInterpolate(unref(tags).length)} \u4E2A\u6807\u7B7E</p></div>`);
          if (unref(tags).length === 0) {
            _push(`<div class="px-5 py-12 text-center text-sm text-slate-500"> \u6682\u65E0\u6807\u7B7E\uFF0C\u8BF7\u5728\u4E0A\u65B9\u6DFB\u52A0 </div>`);
          } else {
            _push(`<div class="flex flex-wrap gap-2 p-5"><!--[-->`);
            ssrRenderList(unref(tags), (item) => {
              _push(`<div class="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 hover:border-blue-300">`);
              if (unref(editingTagId) === item.id) {
                _push(`<!--[--><input${ssrRenderAttr("value", item.name)} class="min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="\u540D\u79F0"><input${ssrRenderAttr("value", item.slug)} class="min-w-[100px] rounded border border-slate-200 bg-white px-2 py-1 text-sm" placeholder="\u522B\u540D"><button class="rounded p-1 text-emerald-600 hover:bg-emerald-100" type="button" title="\u4FDD\u5B58"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg></button><button class="rounded p-1 text-slate-400 hover:bg-slate-200" type="button" title="\u53D6\u6D88"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><!--]-->`);
              } else {
                _push(`<!--[--><span class="text-sm font-medium text-slate-700">#${ssrInterpolate(item.name)}</span><button class="rounded p-0.5 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-blue-600 group-hover:opacity-100" type="button" title="\u7F16\u8F91"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button><button class="rounded p-0.5 text-slate-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100" type="button" title="\u5220\u9664"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button><!--]-->`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/content.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=content-DEe1mmcy.mjs.map
