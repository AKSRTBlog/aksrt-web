import { ref, defineComponent, computed, watch, unref, useSSRContext } from "vue";
import { ssrRenderTeleport, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList } from "vue/server-renderer";
import { u as uploadAdminMediaFile, r as readImageDimensions, a as getMediaUsageLabel, f as formatMediaSize, b as formatMediaDate, c as getMediaKindLabel } from "./admin-media-DKXf4jjq.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
function useMediaPicker() {
  const { adminApiFetch } = useAdminSession();
  const loading = ref(false);
  const uploading = ref(false);
  const error = ref("");
  const items = ref([]);
  const total = ref(0);
  const keyword = ref("");
  const page = ref(1);
  const pageSize = 24;
  async function loadMedia() {
    loading.value = true;
    error.value = "";
    try {
      const params = new URLSearchParams({
        page: String(page.value),
        pageSize: String(pageSize),
        status: "active",
        sortBy: "createdAt",
        sortOrder: "desc"
      });
      if (keyword.value.trim()) {
        params.set("keyword", keyword.value.trim());
      }
      const result = await adminApiFetch(
        `/api/v1/admin/media?${params.toString()}`
      );
      items.value = result.list;
      total.value = result.total;
      if (page.value > 1 && items.value.length === 0 && total.value > 0) {
        page.value -= 1;
        return loadMedia();
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "加载媒体库失败";
    } finally {
      loading.value = false;
    }
  }
  async function uploadFiles(files, usage = "article_content") {
    const queue = Array.from(files).filter((file) => file instanceof File);
    if (queue.length === 0) {
      return [];
    }
    uploading.value = true;
    error.value = "";
    const uploaded = [];
    try {
      for (const file of queue) {
        const result = await uploadAdminMediaFile(adminApiFetch, file, usage);
        uploaded.push(result);
      }
      page.value = 1;
      await loadMedia();
      return uploaded;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "上传失败";
      return uploaded;
    } finally {
      uploading.value = false;
    }
  }
  function resetState() {
    keyword.value = "";
    page.value = 1;
    error.value = "";
  }
  return {
    loading,
    uploading,
    error,
    items,
    total,
    keyword,
    page,
    pageSize,
    loadMedia,
    uploadFiles,
    resetState
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "MediaPickerDialog",
  __ssrInlineRender: true,
  props: {
    open: { type: Boolean },
    title: { default: "选择媒体" },
    emptyMessage: { default: "媒体库还是空的，先上传一张图片吧。" },
    searchPlaceholder: { default: "按文件名搜索媒体..." },
    uploadUsage: { default: "article_content" }
  },
  emits: ["close", "select"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const {
      loading,
      uploading,
      error,
      items,
      total,
      keyword,
      page,
      pageSize,
      loadMedia,
      resetState
    } = useMediaPicker();
    const activeTab = ref("library");
    const selectedId = ref(null);
    ref(null);
    const isDragging = ref(false);
    const selectedDimensions = ref(null);
    const copied = ref(false);
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)));
    const selectedAsset = computed(() => items.value.find((asset) => asset.id === selectedId.value) ?? null);
    const currentRangeLabel = computed(() => {
      if (total.value === 0) {
        return "0 / 0";
      }
      const start = (page.value - 1) * pageSize + 1;
      const end = Math.min(page.value * pageSize, total.value);
      return `${start}-${end} / ${total.value}`;
    });
    watch(() => props.open, async (isOpen) => {
      if (!isOpen) {
        activeTab.value = "library";
        selectedId.value = null;
        selectedDimensions.value = null;
        isDragging.value = false;
        copied.value = false;
        return;
      }
      activeTab.value = "library";
      resetState();
      await refreshLibrary();
    });
    watch(items, (nextItems) => {
      if (nextItems.length === 0) {
        selectedId.value = null;
        return;
      }
      if (!selectedId.value || !nextItems.some((item) => item.id === selectedId.value)) {
        selectedId.value = nextItems[0]?.id ?? null;
      }
    });
    watch(selectedAsset, async (asset) => {
      copied.value = false;
      selectedDimensions.value = asset ? await readImageDimensions(asset.url) : null;
    });
    async function refreshLibrary(options) {
      await loadMedia();
      selectedId.value = items.value[0]?.id ?? null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"><div class="admin-card flex h-[min(88vh,860px)] w-full max-w-6xl flex-col overflow-hidden shadow-2xl"><div class="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Media Library </p><h3 class="mt-1 text-xl font-semibold text-slate-900">${ssrInterpolate(__props.title)}</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="flex items-center gap-2 border-b border-[var(--admin-border)] bg-slate-50 px-4 py-3"><button class="${ssrRenderClass(unref(activeTab) === "library" ? "admin-button-primary" : "admin-button-secondary")}" type="button"> 媒体库 </button><button class="${ssrRenderClass(unref(activeTab) === "upload" ? "admin-button-primary" : "admin-button-secondary")}" type="button"> 上传文件 </button><div class="ml-auto text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset) ? "已选择 1 个媒体项" : "请选择一项媒体资源")}</div></div>`);
          if (unref(error)) {
            _push2(`<div class="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(activeTab) === "upload") {
            _push2(`<div class="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]"><div class="flex min-h-0 flex-col"><div class="border-b border-[var(--admin-border)] px-5 py-4"><p class="text-sm text-slate-600"> 拖拽图片到这里，或从电脑中一次选择多张上传。上传完成后会自动回到媒体库并选中新文件。 </p></div><div class="flex min-h-0 flex-1 items-center justify-center p-6"><div class="${ssrRenderClass([unref(isDragging) ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/80", "flex w-full max-w-2xl flex-col items-center justify-center rounded-[2rem] border-2 border-dashed px-8 py-16 text-center transition"])}"><div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg></div><h4 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(uploading) ? "正在上传媒体..." : "拖拽文件到此处上传")}</h4><p class="mt-2 max-w-lg text-sm leading-7 text-slate-500"> 支持 JPG、PNG、GIF、WebP、SVG。建议上传清晰、压缩过的图片，媒体用途将按当前弹窗场景自动标记。 </p><input type="file" accept="image/*" multiple class="hidden"><button class="admin-button-primary mt-6"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} type="button">${ssrInterpolate(unref(uploading) ? "上传中..." : "选择文件")}</button></div></div></div><aside class="border-l border-[var(--admin-border)] bg-slate-50/60 p-5"><div class="space-y-4"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Tips </p><h4 class="mt-2 text-base font-semibold text-slate-900"> 上传建议 </h4></div><ul class="space-y-3 text-sm leading-7 text-slate-600"><li>建议一次上传同一批内容会使用到的图片，后续筛选会更清晰。</li><li>Banner 和封面图尽量保持横向比例，便于前台复用。</li><li>上传完成后会自动回到媒体库，你可以立即查看详情并插入。</li></ul></div></aside></div>`);
          } else {
            _push2(`<div class="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]"><div class="flex min-h-0 flex-col"><div class="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:flex-row"><div class="flex-1"><input${ssrRenderAttr("value", unref(keyword))} class="admin-input"${ssrRenderAttr("placeholder", __props.searchPlaceholder)}></div><div class="flex gap-2"><button class="admin-button-secondary" type="button"> 搜索 </button><button class="admin-button-secondary" type="button"> 刷新 </button></div></div><div class="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4">`);
            if (unref(loading)) {
              _push2(`<div class="flex h-full min-h-60 items-center justify-center text-sm text-slate-500"> 正在加载媒体库... </div>`);
            } else if (unref(items).length === 0) {
              _push2(`<div class="flex h-full min-h-60 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 text-center"><p class="text-base font-medium text-slate-700">${ssrInterpolate(__props.emptyMessage)}</p><p class="mt-2 text-sm text-slate-500"> 你可以先切换到“上传文件”，再回来选择需要插入的媒体。 </p></div>`);
            } else {
              _push2(`<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"><!--[-->`);
              ssrRenderList(unref(items), (asset) => {
                _push2(`<button class="${ssrRenderClass([unref(selectedId) === asset.id ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]" : "border-[var(--admin-border)] hover:border-slate-300", "group overflow-hidden rounded-[1.25rem] border bg-white text-left transition"])}" type="button"><div class="relative aspect-square overflow-hidden bg-slate-100"><img${ssrRenderAttr("src", asset.url)}${ssrRenderAttr("alt", asset.originalFilename)} class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"><div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3"><div class="flex items-center justify-between gap-2 text-[11px] text-white/90"><span class="rounded-full bg-white/15 px-2 py-1 font-medium backdrop-blur">${ssrInterpolate(unref(getMediaUsageLabel)(asset.usage))}</span><span>${ssrInterpolate(unref(formatMediaSize)(asset.size))}</span></div></div></div><div class="space-y-1 px-3 py-3"><p class="truncate text-sm font-medium text-slate-800">${ssrInterpolate(asset.originalFilename)}</p><p class="truncate text-xs text-slate-500">${ssrInterpolate(unref(formatMediaDate)(asset.createdAt))}</p></div></button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div><div class="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3"><div class="text-sm text-slate-500">${ssrInterpolate(unref(currentRangeLabel))}</div><div class="flex gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} type="button"> 上一页 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} type="button"> 下一页 </button></div></div></div><aside class="flex min-h-0 flex-col border-l border-[var(--admin-border)] bg-white"><div class="border-b border-[var(--admin-border)] px-5 py-4"><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Attachment Details </p><h4 class="mt-2 text-base font-semibold text-slate-900"> 附件详情 </h4></div>`);
            if (unref(selectedAsset)) {
              _push2(`<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5"><div class="space-y-5"><div class="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-slate-100"><img${ssrRenderAttr("src", unref(selectedAsset).url)}${ssrRenderAttr("alt", unref(selectedAsset).originalFilename)} class="h-56 w-full object-cover"></div><div class="space-y-2"><h5 class="break-all text-base font-semibold text-slate-900">${ssrInterpolate(unref(selectedAsset).title || unref(selectedAsset).originalFilename)}</h5><p class="break-all text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset).originalFilename)}</p></div><dl class="space-y-3 text-sm"><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">文件类型</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaKindLabel)(unref(selectedAsset)))} / ${ssrInterpolate(unref(selectedAsset).mimeType)}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">文件大小</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaSize)(unref(selectedAsset).size))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">媒体用途</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">尺寸</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedDimensions) || "读取中...")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">Alt 文本</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedAsset).altText || "未填写")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">上传时间</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaDate)(unref(selectedAsset).createdAt))}</dd></div></dl><div class="space-y-2"><label class="block text-sm font-medium text-slate-700">文件地址</label><textarea class="admin-textarea min-h-28 text-xs leading-6" readonly>${ssrInterpolate(unref(selectedAsset).url)}</textarea></div><div class="grid grid-cols-2 gap-3"><button class="admin-button-secondary" type="button">${ssrInterpolate(unref(copied) ? "已复制" : "复制链接")}</button><a class="admin-button-secondary text-center"${ssrRenderAttr("href", unref(selectedAsset).url)} target="_blank" rel="noreferrer"> 打开原图 </a></div></div></div>`);
            } else {
              _push2(`<div class="flex flex-1 items-center justify-center px-6 text-center text-sm leading-7 text-slate-500"> 从左侧媒体网格中选择一项，这里会显示与 WordPress 类似的附件详情信息。 </div>`);
            }
            _push2(`<div class="border-t border-[var(--admin-border)] px-5 py-4"><div class="flex flex-col gap-3"><button class="admin-button-primary w-full"${ssrIncludeBooleanAttr(!unref(selectedAsset)) ? " disabled" : ""} type="button"> 插入所选媒体 </button><button class="admin-button-secondary w-full" type="button"> 取消 </button></div></div></aside></div>`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/MediaPickerDialog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=MediaPickerDialog-CKbzUmQT.js.map
