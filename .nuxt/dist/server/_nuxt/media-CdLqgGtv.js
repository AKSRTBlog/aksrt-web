import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as _sfc_main$2 } from "./AdminSearchField-D_EqVhFL.js";
import { ref, computed, defineComponent, watch, mergeProps, withCtx, createVNode, unref, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from "vue/server-renderer";
import { f as formatMediaSize, u as uploadAdminMediaFile, r as readImageDimensions, m as mediaSortOptions, g as getMediaExtension, a as getMediaUsageLabel, b as formatMediaDate, c as getMediaKindLabel } from "./admin-media-DKXf4jjq.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
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
function useAdminMedia() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const loading = ref(false);
  const uploading = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const keyword = ref("");
  const usage = ref("");
  const status = ref("active");
  const sortBy = ref("createdAt");
  const sortOrder = ref("desc");
  const page = ref(1);
  const pageSize = 30;
  const total = ref(0);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
  const hasFilters = computed(
    () => Boolean(keyword.value.trim()) || Boolean(usage.value) || status.value !== "active" || sortBy.value !== "createdAt" || sortOrder.value !== "desc"
  );
  let messageTimer = null;
  function clearMessageTimer() {
    if (messageTimer) {
      clearTimeout(messageTimer);
      messageTimer = null;
    }
  }
  function showMessage(message, isError = false) {
    clearMessageTimer();
    if (isError) {
      error.value = message;
      successMessage.value = "";
    } else {
      successMessage.value = message;
      error.value = "";
    }
    if (!message) {
      return;
    }
    messageTimer = setTimeout(() => {
      error.value = "";
      successMessage.value = "";
      messageTimer = null;
    }, 3200);
  }
  async function loadItems() {
    loading.value = true;
    error.value = "";
    try {
      const params = new URLSearchParams({
        page: String(page.value),
        pageSize: String(pageSize),
        sortBy: sortBy.value,
        sortOrder: sortOrder.value
      });
      if (keyword.value.trim()) {
        params.set("keyword", keyword.value.trim());
      }
      if (usage.value) {
        params.set("usage", usage.value);
      }
      if (status.value) {
        params.set("status", status.value);
      }
      const result = await adminApiFetch(`/api/v1/admin/media?${params.toString()}`);
      items.value = result.list;
      total.value = result.total;
      if (page.value > 1 && items.value.length === 0 && total.value > 0) {
        page.value = Math.min(page.value - 1, Math.max(1, Math.ceil(total.value / pageSize)));
        return loadItems();
      }
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "加载媒体资源失败", true);
    } finally {
      loading.value = false;
    }
  }
  async function uploadFiles(files, usageValue = "misc") {
    const queue = Array.from(files).filter((file) => file instanceof File);
    if (queue.length === 0) {
      return [];
    }
    uploading.value = true;
    error.value = "";
    const uploaded = [];
    let failed = 0;
    let lastErrorMessage = "";
    try {
      for (const file of queue) {
        try {
          const result = await uploadAdminMediaFile(adminApiFetch, file, usageValue);
          uploaded.push(result);
        } catch (e) {
          failed += 1;
          lastErrorMessage = e instanceof Error ? e.message : "上传失败";
        }
      }
      page.value = 1;
      await loadItems();
      if (uploaded.length > 0) {
        if (failed > 0) {
          showMessage(`已上传 ${uploaded.length} 个文件，另有 ${failed} 个失败`);
        } else if (uploaded.length === 1) {
          showMessage("文件上传成功");
        } else {
          showMessage(`已上传 ${uploaded.length} 个文件`);
        }
      } else {
        showMessage(lastErrorMessage || "上传失败", true);
      }
      return uploaded;
    } finally {
      uploading.value = false;
    }
  }
  async function deleteFile(asset, options) {
    if (!options?.skipConfirm && !confirm(`确定要删除 “${asset.originalFilename || asset.filename}” 吗？`)) {
      return false;
    }
    error.value = "";
    try {
      await adminApiFetch(`/api/v1/admin/media/${asset.id}`, {
        method: "DELETE"
      });
      const nextTotal = Math.max(0, total.value - 1);
      const shouldGoPreviousPage = items.value.length === 1 && page.value > 1;
      items.value = items.value.filter((item) => item.id !== asset.id);
      total.value = nextTotal;
      if (shouldGoPreviousPage) {
        page.value -= 1;
        await loadItems();
      }
      showMessage("文件已删除");
      return true;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "删除失败", true);
      return false;
    }
  }
  async function copyUrl(url) {
    try {
      await (void 0).clipboard.writeText(url);
      showMessage("链接已复制到剪贴板");
      return true;
    } catch {
      showMessage("复制失败，请手动复制链接", true);
      return false;
    }
  }
  async function saveMetadata(assetId, input) {
    error.value = "";
    try {
      const result = await adminApiFetch(`/api/v1/admin/media/${assetId}`, {
        method: "PATCH",
        body: JSON.stringify(input)
      });
      items.value = items.value.map((item) => item.id === result.id ? result : item);
      showMessage("附件详情已更新");
      return result;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "保存附件详情失败", true);
      return null;
    }
  }
  function resetFilters() {
    keyword.value = "";
    usage.value = "";
    status.value = "active";
    sortBy.value = "createdAt";
    sortOrder.value = "desc";
    page.value = 1;
  }
  return {
    items,
    loading,
    uploading,
    error,
    successMessage,
    keyword,
    usage,
    status,
    sortBy,
    sortOrder,
    page,
    pageSize,
    total,
    totalPages,
    hasFilters,
    loadItems,
    uploadFiles,
    deleteFile,
    copyUrl,
    saveMetadata,
    resetFilters,
    formatSize: formatMediaSize
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "media",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "媒体资源"
    });
    const {
      items,
      loading,
      uploading,
      error,
      successMessage,
      keyword,
      sortBy,
      page,
      pageSize,
      total,
      totalPages,
      loadItems,
      uploadFiles,
      formatSize
    } = useAdminMedia();
    const fileInput = ref(null);
    const searchDraft = ref("");
    const selectedId = ref(null);
    const selectedDimensions = ref(null);
    const isDragging = ref(false);
    ref(0);
    const detailsOpen = ref(false);
    const selectedAsset = computed(() => items.value.find((asset) => asset.id === selectedId.value) ?? null);
    const currentRangeLabel = computed(() => {
      if (total.value === 0) {
        return "0 / 0";
      }
      const start = (page.value - 1) * pageSize + 1;
      const end = Math.min(page.value * pageSize, total.value);
      return `${start}-${end} / ${total.value}`;
    });
    watch(items, (nextItems) => {
      if (nextItems.length === 0) {
        selectedId.value = null;
        detailsOpen.value = false;
        return;
      }
      if (selectedId.value && !nextItems.some((item) => item.id === selectedId.value)) {
        selectedId.value = null;
        detailsOpen.value = false;
      }
    });
    watch(selectedAsset, async (asset) => {
      if (!asset) {
        selectedDimensions.value = null;
        return;
      }
      selectedDimensions.value = await readImageDimensions(asset.url);
    });
    watch(detailsOpen, (open) => {
    });
    async function refreshLibrary(options) {
      const previousSelection = selectedId.value;
      await loadItems();
      if (previousSelection && items.value.some((item) => item.id === previousSelection)) {
        selectedId.value = previousSelection;
      }
    }
    function applyFilters() {
      keyword.value = searchDraft.value.trim();
      page.value = 1;
      refreshLibrary();
    }
    async function handleFiles(fileList) {
      const uploaded = await uploadFiles(fileList, "misc");
      if (uploaded.length > 0) {
        selectedId.value = uploaded[0]?.id ?? null;
      }
    }
    function handleFileChange(event) {
      const target = event.target;
      if (target.files?.length) {
        handleFiles(target.files);
      }
      target.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminSearchField = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "媒体资源",
        description: "按 WordPress 媒体库的浏览方式集中管理站点图片素材，点击卡片即可用弹窗查看附件详情。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<input type="file" accept="image/*" multiple class="hidden"${_scopeId}>`);
          } else {
            return [
              createVNode("input", {
                ref_key: "fileInput",
                ref: fileInput,
                type: "file",
                accept: "image/*",
                multiple: "",
                class: "hidden",
                onChange: handleFileChange
              }, null, 544)
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
      _push(`<div class="admin-card p-4 sm:p-5"><div class="${ssrRenderClass([unref(isDragging) ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/50", "flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed px-5 py-8 text-center transition sm:px-8 sm:py-10"])}" role="button" tabindex="0"><div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"></path></svg></div><h3 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(uploading) ? "正在上传媒体..." : "拖拽图片到这里，或点击这里上传")}</h3><p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500"> 支持 JPG、PNG、GIF、WebP、SVG。适合批量拖入素材，上传完成后会自动出现在下方媒体库中。 </p><button class="admin-button-secondary mt-5"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} type="button">${ssrInterpolate(unref(uploading) ? "上传中..." : "选择文件")}</button></div></div><div class="admin-card p-4"><div class="flex flex-col gap-3 lg:flex-row lg:items-center"><div class="min-w-0 flex-1">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(searchDraft),
        "onUpdate:modelValue": ($event) => isRef(searchDraft) ? searchDraft.value = $event : null,
        placeholder: "按文件名搜索媒体...",
        onKeyup: applyFilters
      }, null, _parent));
      _push(`</div><div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0"><select class="admin-select min-w-0 sm:w-40"><!--[-->`);
      ssrRenderList(unref(mediaSortOptions), (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)}${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), option.value) : ssrLooseEqual(unref(sortBy), option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select><button class="admin-button-secondary whitespace-nowrap" type="button"> 搜索 </button></div></div></div><section><div class="admin-card relative overflow-hidden">`);
      if (unref(isDragging)) {
        _push(`<div class="absolute inset-4 z-10 flex items-center justify-center rounded-[1.75rem] border-2 border-dashed border-blue-500 bg-blue-50/95 text-center text-sm font-medium text-blue-700 backdrop-blur"> 松开鼠标即可上传到媒体库 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"> Library </p><h3 class="mt-1 text-lg font-semibold text-slate-900"> 媒体网格 </h3></div><p class="text-sm text-slate-500">${ssrInterpolate(unref(uploading) ? "正在上传，请稍候..." : "支持拖拽批量上传，点击卡片查看详情")}</p></div>`);
      if (unref(loading)) {
        _push(`<div class="flex min-h-[440px] items-center justify-center px-6 text-sm text-slate-500"> 正在加载媒体资源... </div>`);
      } else if (unref(items).length === 0) {
        _push(`<div class="flex min-h-[440px] flex-col items-center justify-center px-6 text-center"><p class="text-base font-medium text-slate-700"> 媒体库里还没有符合筛选条件的内容 </p><p class="mt-2 text-sm text-slate-500"> 拖拽图片到这里，或点击右上角“上传文件”补充素材。 </p></div>`);
      } else {
        _push(`<div><div class="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 xl:grid-cols-4 2xl:grid-cols-5"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<button class="${ssrRenderClass([unref(selectedId) === item.id ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]" : "border-[var(--admin-border)] hover:border-slate-300", "group overflow-hidden rounded-[1.25rem] border bg-white text-left transition"])}" type="button"><div class="relative aspect-[4/3] overflow-hidden bg-slate-100"><img${ssrRenderAttr("src", item.url)}${ssrRenderAttr("alt", item.originalFilename)} class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"><div class="absolute inset-x-0 top-0 flex items-center justify-between px-2.5 py-2.5 sm:px-3 sm:py-3"><span class="rounded-full bg-slate-950/65 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">${ssrInterpolate(unref(getMediaExtension)(item))}</span>`);
          if (unref(selectedId) === item.id) {
            _push(`<span class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent px-2.5 py-2.5 sm:px-3 sm:py-3"><div class="flex items-center justify-between gap-2 text-[11px] text-white/90"><span class="truncate rounded-full bg-white/15 px-2 py-1 font-medium backdrop-blur">${ssrInterpolate(unref(getMediaUsageLabel)(item.usage))}</span><span>${ssrInterpolate(unref(formatSize)(item.size))}</span></div></div></div><div class="space-y-0.5 px-3 py-2.5"><p class="truncate text-sm font-medium text-slate-800">${ssrInterpolate(item.title || item.originalFilename)}</p><p class="truncate text-xs text-slate-500">${ssrInterpolate(unref(formatMediaDate)(item.createdAt))}</p></div></button>`);
        });
        _push(`<!--]--></div><div class="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-4"><p class="text-sm text-slate-500">${ssrInterpolate(unref(currentRangeLabel))}</p><div class="flex gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} type="button"> 上一页 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} type="button"> 下一页 </button></div></div></div>`);
      }
      _push(`</div></section>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(detailsOpen) && unref(selectedAsset)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-950/70 px-0 py-0 sm:items-center sm:px-4 sm:py-6"><div class="admin-card flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-[min(90vh,900px)] sm:max-h-[min(90vh,900px)] sm:rounded-[4px]"><div class="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-4 sm:px-6"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Attachment Details </p><h3 class="mt-1 text-xl font-semibold text-slate-900"> 附件详情 </h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden"><div class="min-h-0 flex-1 overflow-hidden bg-slate-50/70 p-4 sm:p-5"><div class="flex flex-wrap items-center gap-2 pb-3"><span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">${ssrInterpolate(unref(getMediaExtension)(unref(selectedAsset)))}</span><span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</span><span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">${ssrInterpolate(unref(formatSize)(unref(selectedAsset).size))}</span></div><div class="flex h-[38vh] min-h-[16rem] max-h-[24rem] items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-slate-100 sm:h-[44vh] sm:max-h-[30rem] xl:h-[calc(90vh-11rem)] xl:min-h-0 xl:max-h-none"><img${ssrRenderAttr("src", unref(selectedAsset).url)}${ssrRenderAttr("alt", unref(selectedAsset).originalFilename)} class="max-h-full max-w-full object-contain"></div></div><aside class="min-h-0 border-t border-[var(--admin-border)] bg-white p-4 xl:w-[320px] xl:flex-none xl:border-l xl:border-t-0"><div class="flex flex-col gap-4"><div class="space-y-2"><h4 class="break-all text-base font-semibold text-slate-900">${ssrInterpolate(unref(selectedAsset).title || unref(selectedAsset).originalFilename)}</h4><p class="break-all text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset).originalFilename)}</p></div><dl class="space-y-2.5 text-sm"><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">媒体类型</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaKindLabel)(unref(selectedAsset)))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">MIME</dt><dd class="break-all text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedAsset).mimeType)}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">用途</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">大小</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatSize)(unref(selectedAsset).size))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">尺寸</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedDimensions) || "读取中...")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">上传时间</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaDate)(unref(selectedAsset).createdAt))}</dd></div></dl><div class="space-y-2"><label class="block text-sm font-medium text-slate-700">文件地址</label><textarea class="admin-textarea min-h-20 text-xs leading-5" readonly>${ssrInterpolate(unref(selectedAsset).url)}</textarea></div><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><button class="admin-button-secondary" type="button"> 复制链接 </button><a class="admin-button-secondary text-center"${ssrRenderAttr("href", unref(selectedAsset).url)} target="_blank" rel="noreferrer"> 打开原图 </a></div><button class="admin-button-danger w-full" type="button"> 删除此媒体 </button></div></aside></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/media.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=media-CdLqgGtv.js.map
