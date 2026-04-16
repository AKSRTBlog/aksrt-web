import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as _sfc_main$2 } from './AdminSearchField-D_EqVhFL.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createVNode, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { r as readImageDimensions, m as mediaSortOptions, g as getMediaExtension, a as getMediaUsageLabel, f as formatMediaDate, b as getMediaKindLabel, c as formatMediaSize, u as uploadAdminMediaFile } from './admin-media-DKXf4jjq.mjs';
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
  function showMessage(message, isError2 = false) {
    clearMessageTimer();
    if (isError2) {
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
      showMessage(e instanceof Error ? e.message : "\u52A0\u8F7D\u5A92\u4F53\u8D44\u6E90\u5931\u8D25", true);
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
          lastErrorMessage = e instanceof Error ? e.message : "\u4E0A\u4F20\u5931\u8D25";
        }
      }
      page.value = 1;
      await loadItems();
      if (uploaded.length > 0) {
        if (failed > 0) {
          showMessage(`\u5DF2\u4E0A\u4F20 ${uploaded.length} \u4E2A\u6587\u4EF6\uFF0C\u53E6\u6709 ${failed} \u4E2A\u5931\u8D25`);
        } else if (uploaded.length === 1) {
          showMessage("\u6587\u4EF6\u4E0A\u4F20\u6210\u529F");
        } else {
          showMessage(`\u5DF2\u4E0A\u4F20 ${uploaded.length} \u4E2A\u6587\u4EF6`);
        }
      } else {
        showMessage(lastErrorMessage || "\u4E0A\u4F20\u5931\u8D25", true);
      }
      return uploaded;
    } finally {
      uploading.value = false;
    }
  }
  async function deleteFile(asset, options) {
    if (!(options == null ? void 0 : options.skipConfirm) && !confirm(`\u786E\u5B9A\u8981\u5220\u9664 \u201C${asset.originalFilename || asset.filename}\u201D \u5417\uFF1F`)) {
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
      showMessage("\u6587\u4EF6\u5DF2\u5220\u9664");
      return true;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u5220\u9664\u5931\u8D25", true);
      return false;
    }
  }
  async function copyUrl(url) {
    try {
      await (void 0).clipboard.writeText(url);
      showMessage("\u94FE\u63A5\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F");
      return true;
    } catch {
      showMessage("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236\u94FE\u63A5", true);
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
      showMessage("\u9644\u4EF6\u8BE6\u60C5\u5DF2\u66F4\u65B0");
      return result;
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "\u4FDD\u5B58\u9644\u4EF6\u8BE6\u60C5\u5931\u8D25", true);
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
      title: "\u5A92\u4F53\u8D44\u6E90"
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
      var _a, _b;
      const uploaded = await uploadFiles(fileList, "misc");
      if (uploaded.length > 0) {
        selectedId.value = (_b = (_a = uploaded[0]) == null ? void 0 : _a.id) != null ? _b : null;
      }
    }
    function handleFileChange(event) {
      var _a;
      const target = event.target;
      if ((_a = target.files) == null ? void 0 : _a.length) {
        handleFiles(target.files);
      }
      target.value = "";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminSearchField = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u5A92\u4F53\u8D44\u6E90",
        description: "\u6309 WordPress \u5A92\u4F53\u5E93\u7684\u6D4F\u89C8\u65B9\u5F0F\u96C6\u4E2D\u7BA1\u7406\u7AD9\u70B9\u56FE\u7247\u7D20\u6750\uFF0C\u70B9\u51FB\u5361\u7247\u5373\u53EF\u7528\u5F39\u7A97\u67E5\u770B\u9644\u4EF6\u8BE6\u60C5\u3002"
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
      _push(`<div class="admin-card p-4 sm:p-5"><div class="${ssrRenderClass([unref(isDragging) ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/80 hover:border-blue-300 hover:bg-blue-50/50", "flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed px-5 py-8 text-center transition sm:px-8 sm:py-10"])}" role="button" tabindex="0"><div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm"><svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"></path></svg></div><h3 class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(uploading) ? "\u6B63\u5728\u4E0A\u4F20\u5A92\u4F53..." : "\u62D6\u62FD\u56FE\u7247\u5230\u8FD9\u91CC\uFF0C\u6216\u70B9\u51FB\u8FD9\u91CC\u4E0A\u4F20")}</h3><p class="mt-2 max-w-2xl text-sm leading-7 text-slate-500"> \u652F\u6301 JPG\u3001PNG\u3001GIF\u3001WebP\u3001SVG\u3002\u9002\u5408\u6279\u91CF\u62D6\u5165\u7D20\u6750\uFF0C\u4E0A\u4F20\u5B8C\u6210\u540E\u4F1A\u81EA\u52A8\u51FA\u73B0\u5728\u4E0B\u65B9\u5A92\u4F53\u5E93\u4E2D\u3002 </p><button class="admin-button-secondary mt-5"${ssrIncludeBooleanAttr(unref(uploading)) ? " disabled" : ""} type="button">${ssrInterpolate(unref(uploading) ? "\u4E0A\u4F20\u4E2D..." : "\u9009\u62E9\u6587\u4EF6")}</button></div></div><div class="admin-card p-4"><div class="flex flex-col gap-3 lg:flex-row lg:items-center"><div class="min-w-0 flex-1">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(searchDraft),
        "onUpdate:modelValue": ($event) => isRef(searchDraft) ? searchDraft.value = $event : null,
        placeholder: "\u6309\u6587\u4EF6\u540D\u641C\u7D22\u5A92\u4F53...",
        onKeyup: applyFilters
      }, null, _parent));
      _push(`</div><div class="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0"><select class="admin-select min-w-0 sm:w-40"><!--[-->`);
      ssrRenderList(unref(mediaSortOptions), (option) => {
        _push(`<option${ssrRenderAttr("value", option.value)}${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), option.value) : ssrLooseEqual(unref(sortBy), option.value)) ? " selected" : ""}>${ssrInterpolate(option.label)}</option>`);
      });
      _push(`<!--]--></select><button class="admin-button-secondary whitespace-nowrap" type="button"> \u641C\u7D22 </button></div></div></div><section><div class="admin-card relative overflow-hidden">`);
      if (unref(isDragging)) {
        _push(`<div class="absolute inset-4 z-10 flex items-center justify-center rounded-[1.75rem] border-2 border-dashed border-blue-500 bg-blue-50/95 text-center text-sm font-medium text-blue-700 backdrop-blur"> \u677E\u5F00\u9F20\u6807\u5373\u53EF\u4E0A\u4F20\u5230\u5A92\u4F53\u5E93 </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center justify-between border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"> Library </p><h3 class="mt-1 text-lg font-semibold text-slate-900"> \u5A92\u4F53\u7F51\u683C </h3></div><p class="text-sm text-slate-500">${ssrInterpolate(unref(uploading) ? "\u6B63\u5728\u4E0A\u4F20\uFF0C\u8BF7\u7A0D\u5019..." : "\u652F\u6301\u62D6\u62FD\u6279\u91CF\u4E0A\u4F20\uFF0C\u70B9\u51FB\u5361\u7247\u67E5\u770B\u8BE6\u60C5")}</p></div>`);
      if (unref(loading)) {
        _push(`<div class="flex min-h-[440px] items-center justify-center px-6 text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u5A92\u4F53\u8D44\u6E90... </div>`);
      } else if (unref(items).length === 0) {
        _push(`<div class="flex min-h-[440px] flex-col items-center justify-center px-6 text-center"><p class="text-base font-medium text-slate-700"> \u5A92\u4F53\u5E93\u91CC\u8FD8\u6CA1\u6709\u7B26\u5408\u7B5B\u9009\u6761\u4EF6\u7684\u5185\u5BB9 </p><p class="mt-2 text-sm text-slate-500"> \u62D6\u62FD\u56FE\u7247\u5230\u8FD9\u91CC\uFF0C\u6216\u70B9\u51FB\u53F3\u4E0A\u89D2\u201C\u4E0A\u4F20\u6587\u4EF6\u201D\u8865\u5145\u7D20\u6750\u3002 </p></div>`);
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
        _push(`<!--]--></div><div class="flex items-center justify-between border-t border-[var(--admin-border)] px-5 py-4"><p class="text-sm text-slate-500">${ssrInterpolate(unref(currentRangeLabel))}</p><div class="flex gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) <= 1) ? " disabled" : ""} type="button"> \u4E0A\u4E00\u9875 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(page) >= unref(totalPages)) ? " disabled" : ""} type="button"> \u4E0B\u4E00\u9875 </button></div></div></div>`);
      }
      _push(`</div></section>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(detailsOpen) && unref(selectedAsset)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-950/70 px-0 py-0 sm:items-center sm:px-4 sm:py-6"><div class="admin-card flex h-[100dvh] max-h-[100dvh] w-full max-w-6xl flex-col overflow-hidden rounded-none shadow-2xl sm:h-[min(90vh,900px)] sm:max-h-[min(90vh,900px)] sm:rounded-[4px]"><div class="flex shrink-0 items-center justify-between border-b border-[var(--admin-border)] px-4 py-4 sm:px-6"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"> Attachment Details </p><h3 class="mt-1 text-xl font-semibold text-slate-900"> \u9644\u4EF6\u8BE6\u60C5 </h3></div><button class="admin-button-secondary px-3 py-2" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button></div><div class="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden"><div class="min-h-0 flex-1 overflow-hidden bg-slate-50/70 p-4 sm:p-5"><div class="flex flex-wrap items-center gap-2 pb-3"><span class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">${ssrInterpolate(unref(getMediaExtension)(unref(selectedAsset)))}</span><span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</span><span class="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">${ssrInterpolate(unref(formatSize)(unref(selectedAsset).size))}</span></div><div class="flex h-[38vh] min-h-[16rem] max-h-[24rem] items-center justify-center overflow-hidden rounded-[2rem] border border-[var(--admin-border)] bg-slate-100 sm:h-[44vh] sm:max-h-[30rem] xl:h-[calc(90vh-11rem)] xl:min-h-0 xl:max-h-none"><img${ssrRenderAttr("src", unref(selectedAsset).url)}${ssrRenderAttr("alt", unref(selectedAsset).originalFilename)} class="max-h-full max-w-full object-contain"></div></div><aside class="min-h-0 border-t border-[var(--admin-border)] bg-white p-4 xl:w-[320px] xl:flex-none xl:border-l xl:border-t-0"><div class="flex flex-col gap-4"><div class="space-y-2"><h4 class="break-all text-base font-semibold text-slate-900">${ssrInterpolate(unref(selectedAsset).title || unref(selectedAsset).originalFilename)}</h4><p class="break-all text-sm text-slate-500">${ssrInterpolate(unref(selectedAsset).originalFilename)}</p></div><dl class="space-y-2.5 text-sm"><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u5A92\u4F53\u7C7B\u578B</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaKindLabel)(unref(selectedAsset)))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">MIME</dt><dd class="break-all text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedAsset).mimeType)}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u7528\u9014</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(getMediaUsageLabel)(unref(selectedAsset).usage))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u5927\u5C0F</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatSize)(unref(selectedAsset).size))}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u5C3A\u5BF8</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(selectedDimensions) || "\u8BFB\u53D6\u4E2D...")}</dd></div><div class="flex items-start justify-between gap-4"><dt class="text-slate-500">\u4E0A\u4F20\u65F6\u95F4</dt><dd class="text-right font-medium text-slate-800">${ssrInterpolate(unref(formatMediaDate)(unref(selectedAsset).createdAt))}</dd></div></dl><div class="space-y-2"><label class="block text-sm font-medium text-slate-700">\u6587\u4EF6\u5730\u5740</label><textarea class="admin-textarea min-h-20 text-xs leading-5" readonly>${ssrInterpolate(unref(selectedAsset).url)}</textarea></div><div class="grid grid-cols-1 gap-3 sm:grid-cols-2"><button class="admin-button-secondary" type="button"> \u590D\u5236\u94FE\u63A5 </button><a class="admin-button-secondary text-center"${ssrRenderAttr("href", unref(selectedAsset).url)} target="_blank" rel="noreferrer"> \u6253\u5F00\u539F\u56FE </a></div><button class="admin-button-danger w-full" type="button"> \u5220\u9664\u6B64\u5A92\u4F53 </button></div></aside></div></div></div>`);
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

export { _sfc_main as default };
//# sourceMappingURL=media-CdLqgGtv.mjs.map
