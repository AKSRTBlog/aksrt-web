import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { defineComponent, ref, watch, mergeProps, withCtx, createVNode, unref, openBlock, createBlock, createTextVNode, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { _ as _sfc_main$2 } from './MediaPickerDialog-CKbzUmQT.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import { c as clearNuxtData } from './asyncData-BA1__WkK.mjs';
import './admin-media-DKXf4jjq.mjs';
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

const emptyBannerDraft = {
  title: "",
  description: "",
  imageUrl: "",
  linkUrl: "",
  linkTarget: "_self",
  position: "home_top",
  sortOrder: 0,
  status: "enabled",
  showText: true
};
function useAdminBanners() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const busyId = ref(null);
  const keyword = ref("");
  const status = ref("all");
  const dialogOpen = ref(false);
  const draft = ref({ ...emptyBannerDraft });
  const isEditing = computed(() => Boolean(draft.value.id));
  const stats = computed(() => ({
    total: items.value.length,
    active: items.value.filter((item) => item.status === "enabled").length,
    disabled: items.value.filter((item) => item.status === "disabled").length
  }));
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
  function invalidatePublicBannerViews() {
    clearNuxtData("home-banners");
  }
  async function loadItems() {
    loading.value = true;
    error.value = "";
    try {
      const params = new URLSearchParams({
        pageSize: "100",
        sortBy: "sortOrder",
        sortOrder: "asc"
      });
      if (keyword.value.trim()) {
        params.set("keyword", keyword.value.trim());
      }
      if (status.value !== "all") {
        params.set("status", status.value);
      }
      const result = await adminApiFetch(`/api/v1/admin/banners?${params.toString()}`);
      items.value = result.list;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u52A0\u8F7D Banner \u5931\u8D25", true);
    } finally {
      loading.value = false;
    }
  }
  async function toggleStatus(banner) {
    busyId.value = banner.id;
    error.value = "";
    try {
      const result = await adminApiFetch(`/api/v1/admin/banners/${banner.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: banner.status === "enabled" ? "disabled" : "enabled"
        })
      });
      items.value = items.value.map((item) => item.id === result.id ? result : item);
      invalidatePublicBannerViews();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u66F4\u65B0\u72B6\u6001\u5931\u8D25", true);
    } finally {
      busyId.value = null;
    }
  }
  async function deleteBanner(banner) {
    if (!confirm("\u786E\u5B9A\u8981\u5220\u9664\u6B64 Banner \u5417\uFF1F")) {
      return;
    }
    busyId.value = banner.id;
    error.value = "";
    try {
      await adminApiFetch(`/api/v1/admin/banners/${banner.id}`, {
        method: "DELETE"
      });
      items.value = items.value.filter((item) => item.id !== banner.id);
      invalidatePublicBannerViews();
      showMessage("Banner \u5DF2\u5220\u9664");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u5220\u9664\u5931\u8D25", true);
    } finally {
      busyId.value = null;
    }
  }
  function openCreateDialog() {
    draft.value = {
      ...emptyBannerDraft,
      sortOrder: items.value.reduce((max, item) => Math.max(max, item.sortOrder), -1) + 1
    };
    dialogOpen.value = true;
  }
  function openEditDialog(item) {
    var _a, _b;
    draft.value = {
      id: item.id,
      title: item.title,
      description: (_a = item.description) != null ? _a : "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      linkTarget: item.linkTarget,
      position: item.position,
      sortOrder: item.sortOrder,
      status: item.status,
      showText: (_b = item.showText) != null ? _b : true
    };
    dialogOpen.value = true;
  }
  function closeDialog() {
    dialogOpen.value = false;
    draft.value = { ...emptyBannerDraft };
  }
  async function saveBanner() {
    if (!draft.value.title.trim()) {
      showMessage("\u8BF7\u586B\u5199 Banner \u6807\u9898", true);
      return;
    }
    if (!draft.value.imageUrl.trim()) {
      showMessage("\u8BF7\u9009\u62E9 Banner \u56FE\u7247", true);
      return;
    }
    saving.value = true;
    error.value = "";
    try {
      const body = {
        title: draft.value.title.trim(),
        description: draft.value.description.trim() || null,
        imageUrl: draft.value.imageUrl.trim(),
        linkUrl: draft.value.linkUrl.trim(),
        linkTarget: draft.value.linkTarget,
        position: draft.value.position,
        sortOrder: draft.value.sortOrder,
        status: draft.value.status,
        showText: draft.value.showText
      };
      if (isEditing.value) {
        const result = await adminApiFetch(`/api/v1/admin/banners/${draft.value.id}`, {
          method: "PATCH",
          body: JSON.stringify(body)
        });
        items.value = items.value.map((item) => item.id === result.id ? result : item);
        invalidatePublicBannerViews();
        showMessage("Banner \u5DF2\u66F4\u65B0");
      } else {
        const result = await adminApiFetch("/api/v1/admin/banners", {
          method: "POST",
          body: JSON.stringify(body)
        });
        items.value = [...items.value, result];
        invalidatePublicBannerViews();
        showMessage("Banner \u5DF2\u521B\u5EFA");
      }
      closeDialog();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25", true);
    } finally {
      saving.value = false;
    }
  }
  function selectImage(asset) {
    draft.value.imageUrl = asset.url;
  }
  return {
    // 状态
    items,
    loading,
    saving,
    error,
    successMessage,
    busyId,
    keyword,
    status,
    dialogOpen,
    draft,
    isEditing,
    // 计算属性
    stats,
    // 方法
    loadItems,
    toggleStatus,
    deleteBanner,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    saveBanner,
    selectImage
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "banners",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Banner \u7BA1\u7406"
    });
    const {
      items,
      loading,
      saving,
      error,
      successMessage,
      busyId,
      keyword,
      status,
      dialogOpen,
      draft,
      isEditing,
      stats,
      loadItems,
      openCreateDialog,
      selectImage
    } = useAdminBanners();
    const mediaPickerOpen = ref(false);
    watch([keyword, status], () => {
      loadItems();
    }, { immediate: true });
    watch(dialogOpen, (isOpen) => {
      if (!isOpen) {
        mediaPickerOpen.value = false;
      }
    });
    const positionLabels = {
      home_top: "\u9996\u9875\u9876\u90E8",
      home_sidebar: "\u9996\u9875\u4FA7\u8FB9\u680F",
      article_sidebar: "\u6587\u7AE0\u4FA7\u8FB9\u680F",
      footer: "\u9875\u811A"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Banner \u7BA1\u7406",
        description: "\u7BA1\u7406\u7AD9\u70B9\u5404\u4F4D\u7F6E\u7684 Banner \u56FE\u7247\uFF0C\u652F\u6301\u62D6\u62FD\u6392\u5E8F\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="admin-button-primary"${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> \u65B0\u5EFA Banner </button>`);
          } else {
            return [
              createVNode("button", {
                class: "admin-button-primary",
                onClick: unref(openCreateDialog)
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
                    d: "M12 4v16m8-8H4"
                  })
                ])),
                createTextVNode(" \u65B0\u5EFA Banner ")
              ], 8, ["onClick"])
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
      _push(`<div class="admin-card p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><input${ssrRenderAttr("value", unref(keyword))} class="admin-input max-w-xs" placeholder="\u641C\u7D22 Banner..."><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass(unref(status) === "all" ? "admin-button-primary" : "admin-button-secondary")}"> \u5168\u90E8 ${ssrInterpolate(unref(stats).total)}</button><button class="${ssrRenderClass(unref(status) === "enabled" ? "admin-button-primary" : "admin-button-secondary")}"> \u5DF2\u542F\u7528 ${ssrInterpolate(unref(stats).active)}</button><button class="${ssrRenderClass(unref(status) === "disabled" ? "admin-button-primary" : "admin-button-secondary")}"> \u5DF2\u7981\u7528 ${ssrInterpolate(unref(stats).disabled)}</button></div></div></div><div class="admin-card overflow-hidden">`);
      if (unref(loading)) {
        _push(`<div class="p-6 text-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D... </div>`);
      } else if (unref(items).length === 0) {
        _push(`<div class="p-6 text-center text-sm text-slate-500"> \u6682\u65E0 Banner\uFF0C\u70B9\u51FB\u4E0A\u65B9\u6309\u94AE\u521B\u5EFA\u3002 </div>`);
      } else {
        _push(`<div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<div class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50"><div class="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img${ssrRenderAttr("src", item.imageUrl)}${ssrRenderAttr("alt", item.title)} class="h-full w-full object-cover">`);
          if (item.showText) {
            _push(`<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2"><p class="truncate text-xs font-medium text-white">${ssrInterpolate(item.title)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h4 class="font-medium text-slate-900">${ssrInterpolate(item.title)}</h4><span class="${ssrRenderClass([item.status === "enabled" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500", "rounded-full px-2 py-0.5 text-xs font-medium"])}">${ssrInterpolate(item.status === "enabled" ? "\u5DF2\u542F\u7528" : "\u5DF2\u7981\u7528")}</span></div><p class="mt-1 text-sm text-slate-500"> \u4F4D\u7F6E: ${ssrInterpolate(positionLabels[item.position] || item.position)} <span class="mx-2">|</span> ${ssrInterpolate(item.linkUrl ? "\u94FE\u63A5: " + item.linkUrl : "\u65E0\u94FE\u63A5")}</p>`);
          if (item.description) {
            _push(`<p class="mt-1 text-sm text-slate-400 truncate">${ssrInterpolate(item.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-center gap-2"><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="admin-button-secondary"> \u7F16\u8F91 </button><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="${ssrRenderClass(item.status === "enabled" ? "admin-button-secondary" : "admin-button-primary")}">${ssrInterpolate(item.status === "enabled" ? "\u7981\u7528" : "\u542F\u7528")}</button><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="admin-button-danger"> \u5220\u9664 </button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(dialogOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-2xl overflow-hidden shadow-2xl"><div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><h3 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(isEditing) ? "\u7F16\u8F91 Banner" : "\u65B0\u5EFA Banner")}</h3><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><div><label class="mb-1.5 block text-sm font-medium text-slate-700">Banner \u56FE\u7247 *</label><div class="flex items-start gap-4"><div class="relative h-32 w-64 shrink-0 overflow-hidden rounded-lg bg-slate-100">`);
          if (unref(draft).imageUrl) {
            _push2(`<img${ssrRenderAttr("src", unref(draft).imageUrl)} alt="Banner" class="h-full w-full object-cover">`);
          } else {
            _push2(`<div class="flex h-full w-full items-center justify-center text-slate-400"> \u6682\u65E0\u56FE\u7247 </div>`);
          }
          _push2(`</div><div class="flex-1 space-y-2"><input${ssrRenderAttr("value", unref(draft).imageUrl)} class="admin-input" placeholder="\u56FE\u7247 URL \u6216\u4ECE\u5A92\u4F53\u5E93\u9009\u62E9"><button class="admin-button-secondary" type="button"> \u4ECE\u5A92\u4F53\u5E93\u9009\u62E9 </button></div></div></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u6807\u9898 *</label><input${ssrRenderAttr("value", unref(draft).title)} class="admin-input" placeholder="Banner \u6807\u9898"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u63CF\u8FF0</label><textarea class="admin-textarea" placeholder="Banner \u63CF\u8FF0\uFF08\u53EF\u9009\uFF09">${ssrInterpolate(unref(draft).description)}</textarea></div><div class="grid gap-4 md:grid-cols-2"><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u94FE\u63A5\u5730\u5740</label><input${ssrRenderAttr("value", unref(draft).linkUrl)} class="admin-input" placeholder="https://example.com"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u6253\u5F00\u65B9\u5F0F</label><select class="admin-select"><option value="_self"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).linkTarget) ? ssrLooseContain(unref(draft).linkTarget, "_self") : ssrLooseEqual(unref(draft).linkTarget, "_self")) ? " selected" : ""}>\u5F53\u524D\u7A97\u53E3</option><option value="_blank"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).linkTarget) ? ssrLooseContain(unref(draft).linkTarget, "_blank") : ssrLooseEqual(unref(draft).linkTarget, "_blank")) ? " selected" : ""}>\u65B0\u7A97\u53E3</option></select></div></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u663E\u793A\u4F4D\u7F6E</label><select class="admin-select"><option value="home_top"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "home_top") : ssrLooseEqual(unref(draft).position, "home_top")) ? " selected" : ""}>\u9996\u9875\u9876\u90E8</option><option value="home_sidebar"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "home_sidebar") : ssrLooseEqual(unref(draft).position, "home_sidebar")) ? " selected" : ""}>\u9996\u9875\u4FA7\u8FB9\u680F</option><option value="article_sidebar"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "article_sidebar") : ssrLooseEqual(unref(draft).position, "article_sidebar")) ? " selected" : ""}>\u6587\u7AE0\u4FA7\u8FB9\u680F</option><option value="footer"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "footer") : ssrLooseEqual(unref(draft).position, "footer")) ? " selected" : ""}>\u9875\u811A</option></select></div><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(draft).showText) ? ssrLooseContain(unref(draft).showText, null) : unref(draft).showText) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u56FE\u7247\u4E0A\u663E\u793A\u6807\u9898\u6587\u5B57</span></label></div><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(unref(draft).status === "enabled") ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528\u6B64 Banner</span></label></div></div><div class="flex justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4"><button class="admin-button-secondary" type="button"> \u53D6\u6D88 </button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(ssrRenderComponent(_sfc_main$2, {
        open: unref(dialogOpen) && unref(mediaPickerOpen),
        title: "\u95AB\u590B\u5AE8 Banner \u9365\u5267\u5896",
        "empty-message": "\u93C6\u509B\u68E4\u9359\uE21E\u20AC\u590A\u6D58\u9417\u56F7\u7D1D\u7487\u5CF0\u539B\u6D93\u5A41\u7D36\u6D93\u20AC\u5BEE\u72AE\u20AC?",
        "search-placeholder": "\u93BC\u6EC5\u50A8\u6FEF\u638D\u7D8B\u6434\u64B3\u6D58\u9417?",
        "upload-usage": "banner",
        onClose: ($event) => mediaPickerOpen.value = false,
        onSelect: (asset) => {
          unref(selectImage)(asset);
          mediaPickerOpen.value = false;
        }
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/banners.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=banners-CadV05w7.mjs.map
