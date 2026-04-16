import { defineComponent, ref, computed, watch, unref, useSSRContext } from 'vue';
import { ssrRenderTeleport, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { r as readImageDimensions, a as getMediaUsageLabel, c as formatMediaSize, f as formatMediaDate, b as getMediaKindLabel, u as uploadAdminMediaFile } from './admin-media-DKXf4jjq.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';

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
      error.value = e instanceof Error ? e.message : "\u52A0\u8F7D\u5A92\u4F53\u5E93\u5931\u8D25";
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
      error.value = e instanceof Error ? e.message : "\u4E0A\u4F20\u5931\u8D25";
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
    title: { default: "\u9009\u62E9\u5A92\u4F53" },
    emptyMessage: { default: "\u5A92\u4F53\u5E93\u8FD8\u662F\u7A7A\u7684\uFF0C\u5148\u4E0A\u4F20\u4E00\u5F20\u56FE\u7247\u5427\u3002" },
    searchPlaceholder: { default: "\u6309\u6587\u4EF6\u540D\u641C\u7D22\u5A92\u4F53..." },
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
    const selectedAsset = computed(() => {
      var _a;
      return (_a = items.value.find((asset) => asset.id === selectedId.value)) != null ? _a : null;
    });
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
      var _a, _b;
      if (nextItems.length === 0) {
        selectedId.value = null;
        return;
      }
      if (!selectedId.value || !nextItems.some((item) => item.id === selectedId.value)) {
        selectedId.value = (_b = (_a = nextItems[0]) == null ? void 0 : _a.id) != null ? _b : null;
      }
    });
    watch(selectedAsset, async (asset) => {
      copied.value = false;
      selectedDimensions.value = asset ? await readImageDimensions(asset.url) : null;
    });
    async function refreshLibrary(options) {
      var _a, _b;
      await loadMedia();
      selectedId.value = (_b = (_a = items.value[0]) == null ? void 0 : _a.id) != null ? _b : null;
    }
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderTeleport(_push, (_push2) => {
        if (__props.open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"><div class="admin-card flex h-[min(88vh,860px)] w-full max-w-6xl flex-col overflow-hidden shadow-2xl"><div class="flex items-center justify-between border-b border-[var(--admin-border)] px-6 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Media Library </p><h3 class="mt-1 text-xl font-semibold text-slate-900">${ssrInterpolate(__props.title)}</h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="flex items-center gap-2 border-b border-[var(--admin-border)] bg-slate-50 px-4 py-3"><button class="${ssrRenderClass(unref(activeTab) === "library" ? "admin-button-primary" : "admin-button-secondary")}" type="button"> \u5A92\u4F53\u5E93 </button><button class="${ssrRenderClass(unref(activeTab) === "upload" ? "admin-button-primary" : "admin-button-secondary")}" type="button"> \u4E0A\u4F20\u6587\u4EF6 </button><div class="ml-auto text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset) ? "\u5DF2\u9009\u62E9 1 \u4E2A\u5A92\u4F53\u9879" : "\u8BF7\u9009\u62E9\u4E00\u9879\u5A92\u4F53\u8D44\u6E90")}</div></div>`);
          if (unref(error)) {
            _push2(`<div class="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</div>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(activeTab) === "upload") {
            _push2(`<div class="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]"><div class="flex min-h-0 flex-col"><div class="border-b border-[var(--admin-border)] px-5 py-4"><p class="text-sm text-slate-600"> \u62D6\u62FD\u56FE\u7247\u5230\u8FD9\u91CC\uFF0C\u6216\u4ECE\u7535\u8111\u4E2D\u4E00\u6B21\u9009\u62E9\u591A\u5F20\u4E0A\u4F20\u3002\u4E0A\u4F20\u5B8C\u6210\u540E\u4F1A\u81EA\u52A8\u56DE\u5230\u5A92\u4F53\u5E93\u5E76\u9009\u4E2D\u65B0\u6587\u4EF6\u3002 </p></div><div class="flex min-h-0 flex-1 items-center justify-center p-6"><div class="${ssrRenderClass([unref(isDragging) ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/80", "flex w-full max-w-2xl flex-col items-center justify-center rounded-[2rem] border-2 border-dashed px-8 py-16 text-center transition"])}"><div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg></div><h4 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(uploading) ? "\u6B63\u5728\u4E0A\u4F20\u5A92\u4F53..." : "\u62D6\u62FD\u6587\u4EF6\u5230\u6B64\u5904\u4E0A\u4F20")}</h4><p class="mt-2 max-w-lg text-sm leading-7 text-slate-500"> \u652F\u6301 JPG\u3001PNG\u3001GIF\u3001WebP\u3001SVG\u3002\u5EFA\u8BAE\u4E0A\u4F20\u6E05\u6670\u3001\u538B\u7F29\u8FC7\u7684\u56FE\u7247\uFF0C\u5A92\u4F53\u7528\u9014\u5C06\u6309\u5F53\u524D\u5F39\u7A97\u573A\u666F\u81EA\u52A8\u6807\u8BB0\u3002 </p><input type="file" accept="image/*" multiple class="hidden"><button class="admin-button-primary mt-6"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} type="button">${ssrInterpolate(unref(uploading) ? "\u4E0A\u4F20\u4E2D..." : "\u9009\u62E9\u6587\u4EF6")}</button></div></div></div><aside class="border-l border-[var(--admin-border)] bg-slate-50/60 p-5"><div class="space-y-4"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Tips </p><h4 class="mt-2 text-base font-semibold text-slate-900"> \u4E0A\u4F20\u5EFA\u8BAE </h4></div><ul class="space-y-3 text-sm leading-7 text-slate-600"><li>\u5EFA\u8BAE\u4E00\u6B21\u4E0A\u4F20\u540C\u4E00\u6279\u5185\u5BB9\u4F1A\u4F7F\u7528\u5230\u7684\u56FE\u7247\uFF0C\u540E\u7EED\u7B5B\u9009\u4F1A\u66F4\u6E05\u6670\u3002</li><li>Banner \u548C\u5C01\u9762\u56FE\u5C3D\u91CF\u4FDD\u6301\u6A2A\u5411\u6BD4\u4F8B\uFF0C\u4FBF\u4E8E\u524D\u53F0\u590D\u7528\u3002</li><li>\u4E0A\u4F20\u5B8C\u6210\u540E\u4F1A\u81EA\u52A8\u56DE\u5230\u5A92\u4F53\u5E93\uFF0C\u4F60\u53EF\u4EE5\u7ACB\u5373\u67E5\u770B\u8BE6\u60C5\u5E76\u63D2\u5165\u3002</li></ul></div></aside></div>`);
          } else {
            _push2(`<div class="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]"><div class="flex min-h-0 flex-col"><div class="flex flex-col gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:flex-row"><div class="flex-1"><input${ssrRenderAttr("value", unref(keyword))} class="admin-input"${ssrRenderAttr("placeholder", __props.searchPlaceholder)}></div><div class="flex gap-2"><button class="admin-button-secondary" type="button"> \u641C\u7D22 </button><button class="admin-button-secondary" type="button"> \u5237\u65B0 </button></div></div><div class="min-h-0 flex-1 overflow-y-auto bg-slate-50/50 p-4">`);
            if (unref(loading)) {
              _push2(`<div class="flex h-full min-h-60 items-center justify-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u5A92\u4F53\u5E93... </div>`);
            } else if (unref(items).length === 0) {
              _push2(`<div class="flex h-full min-h-60 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 text-center"><p class="text-base font-medium text-slate-700">${ssrInterpolate(__props.emptyMessage)}</p><p class="mt-2 text-sm text-slate-500"> \u4F60\u53EF\u4EE5\u5148\u5207\u6362\u5230\u201C\u4E0A\u4F20\u6587\u4EF6\u201D\uFF0C\u518D\u56DE\u6765\u9009\u62E9\u9700\u8981\u63D2\u5165\u7684\u5A92\u4F53\u3002 </p></div>`);
            } else {
              _push2(`<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4"><!--[-->`);
              ssrRenderList(unref(items), (asset) => {
                _push2(`<button class="${ssrRenderClass([unref(selectedId) === asset.id ? "border-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]" : "border-[var(--admin-border)] hover:border-slate-300", "group overflow-hidden rounded-[1.25rem] border bg-white text-left transition"])}" type="button"><div class="relative aspect-square overflow-hidden bg-slate-100"><img${ssrRenderAttr("src", asset.url)}${ssrRenderAttr("alt", asset.originalFilename)} class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"><div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent px-3 py-3"><div class="flex items-center justify-between gap-2 text-[11px] text-white/90"><span class="rounded-full bg-white/15 px-2 py-1 font-medium backdrop-blur">${ssrInterpolate(unref(getMediaUsageLabel)(asset.usage))}</span><span>${ssrInterpolate(unref(formatMediaSize)(asset.size))}</span></div></div></div><div class="space-y-1 px-3 py-3"><p class="truncate text-sm font-medium text-slate-800">${ssrInterpolate(asset.originalFilename)}</p><p class="truncate text-xs text-slate-500">${ssrInterpolate(unref(formatMediaDate)(asset.createdAt))}</p></div></button>`);
              });
              _push2(`<!--]--></div>`);
            }
            _push2(`</div><div class="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-3"><div class="text-sm text-slate-500">${ssrInterpolate(unref(currentRangeLabel))}</div><div class="flex gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} type="button"> \u4E0A\u4E00\u9875 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} type="button"> \u4E0B\u4E00\u9875 </button></div></div></div><aside class="flex min-h-0 flex-col border-l border-[var(--admin-border)] bg-white"><div class="border-b border-[var(--admin-border)] px-5 py-4"><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Attachment Details </p><h4 class="mt-2 text-base font-semibold text-slate-900"> \u9644\u4EF6\u8BE6\u60C5 </h4></div>`);
            if (unref(selectedAsset)) {
              _push2(`<div class="min-h-0 flex-1 overflow-y-auto px-5 py-5"><div class="space-y-5"><div class="overflow-hidden rounded-[1.5rem] border border-[var(--admin-border)] bg-slate-100"><img${ssrRenderAttr("src", unref(selectedAsset).url)}${ssrRenderAttr("alt", unref(selectedAsset).originalFilename)} class="h-56 w-full object-cover"></div><div class="space-y-2"><h5 class="break-all text-base font-semibold text-slate-900">${ssrInterpolate(unref(selectedAsset).title || unref(selectedAsset).originalFilename)}</h5><p class="break-all text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset).originalFilename)}</p></div><dl class="space-y-3 text-sm"><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u6587\u4EF6\u7C7B\u578B</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaKindLabel)(unref(selectedAsset)))} / ${ssrInterpolate(unref(selectedAsset).mimeType)}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u6587\u4EF6\u5927\u5C0F</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaSize)(unref(selectedAsset).size))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u5A92\u4F53\u7528\u9014</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u5C3A\u5BF8</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedDimensions) || "\u8BFB\u53D6\u4E2D...")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">Alt \u6587\u672C</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedAsset).altText || "\u672A\u586B\u5199")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u4E0A\u4F20\u65F6\u95F4</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaDate)(unref(selectedAsset).createdAt))}</dd></div></dl><div class="space-y-2"><label class="block text-sm font-medium text-slate-700">\u6587\u4EF6\u5730\u5740</label><textarea class="admin-textarea min-h-28 text-xs leading-6" readonly>${ssrInterpolate(unref(selectedAsset).url)}</textarea></div><div class="grid grid-cols-2 gap-3"><button class="admin-button-secondary" type="button">${ssrInterpolate(unref(copied) ? "\u5DF2\u590D\u5236" : "\u590D\u5236\u94FE\u63A5")}</button><a class="admin-button-secondary text-center"${ssrRenderAttr("href", unref(selectedAsset).url)} target="_blank" rel="noreferrer"> \u6253\u5F00\u539F\u56FE </a></div></div></div>`);
            } else {
              _push2(`<div class="flex flex-1 items-center justify-center px-6 text-center text-sm leading-7 text-slate-500"> \u4ECE\u5DE6\u4FA7\u5A92\u4F53\u7F51\u683C\u4E2D\u9009\u62E9\u4E00\u9879\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u4E0E WordPress \u7C7B\u4F3C\u7684\u9644\u4EF6\u8BE6\u60C5\u4FE1\u606F\u3002 </div>`);
            }
            _push2(`<div class="border-t border-[var(--admin-border)] px-5 py-4"><div class="flex flex-col gap-3"><button class="admin-button-primary w-full"${ssrIncludeBooleanAttr(!unref(selectedAsset)) ? " disabled" : ""} type="button"> \u63D2\u5165\u6240\u9009\u5A92\u4F53 </button><button class="admin-button-secondary w-full" type="button"> \u53D6\u6D88 </button></div></div></aside></div>`);
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

export { _sfc_main as _ };
//# sourceMappingURL=MediaPickerDialog-CKbzUmQT.mjs.map
