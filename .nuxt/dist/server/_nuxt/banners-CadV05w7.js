import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { ref, computed, defineComponent, watch, mergeProps, withCtx, createVNode, unref, openBlock, createBlock, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { _ as _sfc_main$2 } from "./MediaPickerDialog-CKbzUmQT.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import { c as clearNuxtData } from "./asyncData-BA1__WkK.js";
import "./admin-media-DKXf4jjq.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/perfect-debounce/dist/index.mjs";
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
      showMessage(e instanceof Error ? e.message : "加载 Banner 失败", true);
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
      showMessage(e instanceof Error ? e.message : "更新状态失败", true);
    } finally {
      busyId.value = null;
    }
  }
  async function deleteBanner(banner) {
    if (!confirm("确定要删除此 Banner 吗？")) {
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
      showMessage("Banner 已删除");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "删除失败", true);
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
    draft.value = {
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl,
      linkTarget: item.linkTarget,
      position: item.position,
      sortOrder: item.sortOrder,
      status: item.status,
      showText: item.showText ?? true
    };
    dialogOpen.value = true;
  }
  function closeDialog() {
    dialogOpen.value = false;
    draft.value = { ...emptyBannerDraft };
  }
  async function saveBanner() {
    if (!draft.value.title.trim()) {
      showMessage("请填写 Banner 标题", true);
      return;
    }
    if (!draft.value.imageUrl.trim()) {
      showMessage("请选择 Banner 图片", true);
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
        showMessage("Banner 已更新");
      } else {
        const result = await adminApiFetch("/api/v1/admin/banners", {
          method: "POST",
          body: JSON.stringify(body)
        });
        items.value = [...items.value, result];
        invalidatePublicBannerViews();
        showMessage("Banner 已创建");
      }
      closeDialog();
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "保存失败", true);
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
      title: "Banner 管理"
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
      home_top: "首页顶部",
      home_sidebar: "首页侧边栏",
      article_sidebar: "文章侧边栏",
      footer: "页脚"
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "Banner 管理",
        description: "管理站点各位置的 Banner 图片，支持拖拽排序。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="admin-button-primary"${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> 新建 Banner </button>`);
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
                createTextVNode(" 新建 Banner ")
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
      _push(`<div class="admin-card p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between"><input${ssrRenderAttr("value", unref(keyword))} class="admin-input max-w-xs" placeholder="搜索 Banner..."><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass(unref(status) === "all" ? "admin-button-primary" : "admin-button-secondary")}"> 全部 ${ssrInterpolate(unref(stats).total)}</button><button class="${ssrRenderClass(unref(status) === "enabled" ? "admin-button-primary" : "admin-button-secondary")}"> 已启用 ${ssrInterpolate(unref(stats).active)}</button><button class="${ssrRenderClass(unref(status) === "disabled" ? "admin-button-primary" : "admin-button-secondary")}"> 已禁用 ${ssrInterpolate(unref(stats).disabled)}</button></div></div></div><div class="admin-card overflow-hidden">`);
      if (unref(loading)) {
        _push(`<div class="p-6 text-center text-sm text-slate-500"> 正在加载... </div>`);
      } else if (unref(items).length === 0) {
        _push(`<div class="p-6 text-center text-sm text-slate-500"> 暂无 Banner，点击上方按钮创建。 </div>`);
      } else {
        _push(`<div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<div class="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50"><div class="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100"><img${ssrRenderAttr("src", item.imageUrl)}${ssrRenderAttr("alt", item.title)} class="h-full w-full object-cover">`);
          if (item.showText) {
            _push(`<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2"><p class="truncate text-xs font-medium text-white">${ssrInterpolate(item.title)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><h4 class="font-medium text-slate-900">${ssrInterpolate(item.title)}</h4><span class="${ssrRenderClass([item.status === "enabled" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500", "rounded-full px-2 py-0.5 text-xs font-medium"])}">${ssrInterpolate(item.status === "enabled" ? "已启用" : "已禁用")}</span></div><p class="mt-1 text-sm text-slate-500"> 位置: ${ssrInterpolate(positionLabels[item.position] || item.position)} <span class="mx-2">|</span> ${ssrInterpolate(item.linkUrl ? "链接: " + item.linkUrl : "无链接")}</p>`);
          if (item.description) {
            _push(`<p class="mt-1 text-sm text-slate-400 truncate">${ssrInterpolate(item.description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-center gap-2"><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="admin-button-secondary"> 编辑 </button><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="${ssrRenderClass(item.status === "enabled" ? "admin-button-secondary" : "admin-button-primary")}">${ssrInterpolate(item.status === "enabled" ? "禁用" : "启用")}</button><button${ssrIncludeBooleanAttr(unref(busyId) === item.id) ? " disabled" : ""} class="admin-button-danger"> 删除 </button></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(dialogOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6"><div class="admin-card w-full max-w-2xl overflow-hidden shadow-2xl"><div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><h3 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(isEditing) ? "编辑 Banner" : "新建 Banner")}</h3><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="space-y-4 p-5"><div><label class="mb-1.5 block text-sm font-medium text-slate-700">Banner 图片 *</label><div class="flex items-start gap-4"><div class="relative h-32 w-64 shrink-0 overflow-hidden rounded-lg bg-slate-100">`);
          if (unref(draft).imageUrl) {
            _push2(`<img${ssrRenderAttr("src", unref(draft).imageUrl)} alt="Banner" class="h-full w-full object-cover">`);
          } else {
            _push2(`<div class="flex h-full w-full items-center justify-center text-slate-400"> 暂无图片 </div>`);
          }
          _push2(`</div><div class="flex-1 space-y-2"><input${ssrRenderAttr("value", unref(draft).imageUrl)} class="admin-input" placeholder="图片 URL 或从媒体库选择"><button class="admin-button-secondary" type="button"> 从媒体库选择 </button></div></div></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">标题 *</label><input${ssrRenderAttr("value", unref(draft).title)} class="admin-input" placeholder="Banner 标题"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">描述</label><textarea class="admin-textarea" placeholder="Banner 描述（可选）">${ssrInterpolate(unref(draft).description)}</textarea></div><div class="grid gap-4 md:grid-cols-2"><div><label class="mb-1.5 block text-sm font-medium text-slate-700">链接地址</label><input${ssrRenderAttr("value", unref(draft).linkUrl)} class="admin-input" placeholder="https://example.com"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">打开方式</label><select class="admin-select"><option value="_self"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).linkTarget) ? ssrLooseContain(unref(draft).linkTarget, "_self") : ssrLooseEqual(unref(draft).linkTarget, "_self")) ? " selected" : ""}>当前窗口</option><option value="_blank"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).linkTarget) ? ssrLooseContain(unref(draft).linkTarget, "_blank") : ssrLooseEqual(unref(draft).linkTarget, "_blank")) ? " selected" : ""}>新窗口</option></select></div></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">显示位置</label><select class="admin-select"><option value="home_top"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "home_top") : ssrLooseEqual(unref(draft).position, "home_top")) ? " selected" : ""}>首页顶部</option><option value="home_sidebar"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "home_sidebar") : ssrLooseEqual(unref(draft).position, "home_sidebar")) ? " selected" : ""}>首页侧边栏</option><option value="article_sidebar"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "article_sidebar") : ssrLooseEqual(unref(draft).position, "article_sidebar")) ? " selected" : ""}>文章侧边栏</option><option value="footer"${ssrIncludeBooleanAttr(Array.isArray(unref(draft).position) ? ssrLooseContain(unref(draft).position, "footer") : ssrLooseEqual(unref(draft).position, "footer")) ? " selected" : ""}>页脚</option></select></div><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(draft).showText) ? ssrLooseContain(unref(draft).showText, null) : unref(draft).showText) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>图片上显示标题文字</span></label></div><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(unref(draft).status === "enabled") ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>启用此 Banner</span></label></div></div><div class="flex justify-end gap-3 border-t border-[var(--admin-border)] px-5 py-4"><button class="admin-button-secondary" type="button"> 取消 </button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存")}</button></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(ssrRenderComponent(_sfc_main$2, {
        open: unref(dialogOpen) && unref(mediaPickerOpen),
        title: "閫夋嫨 Banner 鍥剧墖",
        "empty-message": "鏆傛棤鍙€夊浘鐗囷紝璇峰厛涓婁紶涓€寮犮€?",
        "search-placeholder": "鎼滅储濯掍綋搴撳浘鐗?",
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
export {
  _sfc_main as default
};
//# sourceMappingURL=banners-CadV05w7.js.map
