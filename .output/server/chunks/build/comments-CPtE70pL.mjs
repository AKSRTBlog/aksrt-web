import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as _sfc_main$2 } from './AdminSearchField-D_EqVhFL.mjs';
import { _ as _sfc_main$3 } from './AdminStatusBadge-BEmRWfoN.mjs';
import { _ as _sfc_main$4 } from './AdminPagination-BcT-QBcs.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, ref, computed, watch, mergeProps, isRef, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
import { a as useHead } from './v3-CVe3IQuN.mjs';
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
import './api-base-COxdl8qP.mjs';

const PAGE_SIZE = 8;
function useAdminComments() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const error = ref("");
  const busyId = ref(null);
  const selectedIds = ref([]);
  const keyword = ref("");
  const status = ref("all");
  const page = ref(1);
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
  const pendingCount = computed(() => items.value.filter((item) => item.status === "pending").length);
  function buildCommentsPath(input) {
    const params = new URLSearchParams({
      page: String(input.page),
      pageSize: String(PAGE_SIZE),
      sortBy: "createdAt",
      sortOrder: "desc"
    });
    if (input.keyword.trim()) {
      params.set("keyword", input.keyword.trim());
    }
    if (input.status !== "all") {
      params.set("status", input.status);
    }
    return `/api/v1/admin/comments?${params.toString()}`;
  }
  async function loadComments() {
    loading.value = true;
    error.value = "";
    try {
      const result = await adminApiFetch(
        buildCommentsPath({ page: page.value, keyword: keyword.value, status: status.value })
      );
      items.value = result.list;
      total.value = result.total;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u52A0\u8F7D\u8BC4\u8BBA\u5931\u8D25";
    } finally {
      loading.value = false;
    }
  }
  async function reloadComments() {
    await loadComments();
  }
  function syncItem(updated) {
    const idx = items.value.findIndex((item) => item.id === updated.id);
    if (idx !== -1) {
      items.value[idx] = updated;
    }
  }
  function removeItem(commentId) {
    items.value = items.value.filter((item) => item.id !== commentId);
    total.value = Math.max(0, total.value - 1);
    selectedIds.value = selectedIds.value.filter((id) => id !== commentId);
  }
  async function reviewComment(commentId, nextStatus, rejectReason) {
    busyId.value = commentId;
    error.value = "";
    try {
      const result = await adminApiFetch(
        `/api/v1/admin/comments/${commentId}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: nextStatus,
            rejectReason: rejectReason != null ? rejectReason : null
          })
        }
      );
      syncItem(result);
      await reloadComments();
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u5BA1\u6838\u8BC4\u8BBA\u5931\u8D25";
      return null;
    } finally {
      busyId.value = null;
    }
  }
  async function deleteComment(comment) {
    if (!confirm("\u786E\u8BA4\u5220\u9664\u8FD9\u6761\u8BC4\u8BBA\u5417\uFF1F\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002")) {
      return false;
    }
    busyId.value = comment.id;
    error.value = "";
    try {
      await adminApiFetch(`/api/v1/admin/comments/${comment.id}`, {
        method: "DELETE"
      });
      removeItem(comment.id);
      await reloadComments();
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u5220\u9664\u8BC4\u8BBA\u5931\u8D25";
      return false;
    } finally {
      busyId.value = null;
    }
  }
  async function runBulkAction(action, targetIds) {
    const targets = targetIds != null ? targetIds : selectedIds.value;
    if (targets.length === 0) {
      return;
    }
    if (action === "delete") {
      if (!confirm(`\u786E\u8BA4\u5220\u9664\u9009\u4E2D\u7684 ${targets.length} \u6761\u8BC4\u8BBA\u5417\uFF1F`)) {
        return;
      }
    }
    error.value = "";
    busyId.value = "bulk";
    try {
      if (action === "delete") {
        for (const id of targets) {
          await adminApiFetch(`/api/v1/admin/comments/${id}`, { method: "DELETE" });
          removeItem(id);
        }
        selectedIds.value = [];
        await reloadComments();
        return;
      }
      const results = await Promise.all(
        targets.map(
          (id) => adminApiFetch(`/api/v1/admin/comments/${id}/review`, {
            method: "PATCH",
            body: JSON.stringify({
              status: action,
              rejectReason: action === "rejected" ? "\u6279\u91CF\u9A73\u56DE" : null
            })
          })
        )
      );
      results.forEach(syncItem);
      await reloadComments();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u6279\u91CF\u64CD\u4F5C\u5931\u8D25";
    } finally {
      busyId.value = null;
    }
  }
  function toggleAllSelection(allSelected) {
    if (allSelected) {
      selectedIds.value = selectedIds.value.filter(
        (id) => !items.value.some((item) => item.id === id)
      );
    } else {
      selectedIds.value = Array.from(
        /* @__PURE__ */ new Set([...selectedIds.value, ...items.value.map((item) => item.id)])
      );
    }
  }
  function toggleSelection(id, checked) {
    if (checked) {
      selectedIds.value = Array.from(/* @__PURE__ */ new Set([...selectedIds.value, id]));
    } else {
      selectedIds.value = selectedIds.value.filter((i) => i !== id);
    }
  }
  function setStatusFilter(newStatus) {
    status.value = newStatus;
    page.value = 1;
  }
  function setKeyword(newKeyword) {
    keyword.value = newKeyword;
    page.value = 1;
  }
  function setPage(newPage) {
    page.value = newPage;
  }
  function resetFilters() {
    keyword.value = "";
    status.value = "all";
    page.value = 1;
  }
  return {
    // 状态
    items,
    total,
    loading,
    error,
    busyId,
    selectedIds,
    keyword,
    status,
    page,
    // 计算属性
    totalPages,
    pendingCount,
    // 方法
    loadComments,
    reloadComments,
    reviewComment,
    deleteComment,
    runBulkAction,
    toggleAllSelection,
    toggleSelection,
    setStatusFilter,
    setKeyword,
    setPage,
    resetFilters
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "comments",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u8BC4\u8BBA\u7BA1\u7406"
    });
    const {
      items,
      total,
      loading,
      error,
      busyId,
      selectedIds,
      keyword,
      status,
      page,
      totalPages,
      pendingCount,
      loadComments,
      setKeyword,
      setPage
    } = useAdminComments();
    const selectedId = ref(null);
    const selectedComment = computed(
      () => {
        var _a, _b;
        return (_b = (_a = items.value.find((item) => item.id === selectedId.value)) != null ? _a : items.value[0]) != null ? _b : null;
      }
    );
    const allVisibleSelected = computed(
      () => items.value.length > 0 && items.value.every((item) => selectedIds.value.includes(item.id))
    );
    watch([page, keyword, status], () => {
      loadComments();
    }, { immediate: true });
    watch(items, (newItems) => {
      if (newItems.length > 0 && !selectedId.value) {
        selectedId.value = newItems[0].id;
      }
    });
    function handleKeywordChange(value) {
      setKeyword(value);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminSearchField = _sfc_main$2;
      const _component_AdminStatusBadge = _sfc_main$3;
      const _component_AdminPagination = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u8BC4\u8BBA\u7BA1\u7406",
        description: "\u6309\u72B6\u6001\u7B5B\u9009\u8BC4\u8BBA\uFF0C\u5E76\u652F\u6301\u5355\u6761\u6216\u6279\u91CF\u5BA1\u6838\u3002"
      }, null, _parent));
      _push(`<div class="admin-card p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(keyword),
        "onUpdate:modelValue": [($event) => isRef(keyword) ? keyword.value = $event : null, handleKeywordChange],
        placeholder: "\u641C\u7D22\u6635\u79F0\u3001\u5185\u5BB9\u6216\u6587\u7AE0\u6807\u9898"
      }, null, _parent));
      _push(`<div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "all" }, "admin-button-secondary"])}"> \u5168\u90E8 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "pending" }, "admin-button-secondary"])}"> \u5F85\u5BA1\u6838 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "approved" }, "admin-button-secondary"])}"> \u5DF2\u901A\u8FC7 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "rejected" }, "admin-button-secondary"])}"> \u5DF2\u9A73\u56DE </button></div></div></div>`);
      if (unref(error)) {
        _push(`<div class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div class="admin-card overflow-hidden"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-sm font-semibold text-slate-900">\u5F53\u524D\u9875 ${ssrInterpolate(unref(items).length)} \u6761</p><p class="text-xs text-slate-500">${ssrInterpolate(unref(pendingCount))} \u6761\u5F85\u5BA1\u6838</p></div><div class="flex flex-wrap gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading) || unref(items).length === 0) ? " disabled" : ""}>${ssrInterpolate(unref(allVisibleSelected) ? "\u53D6\u6D88\u672C\u9875\u5168\u9009" : "\u672C\u9875\u5168\u9009")}</button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> \u6279\u91CF\u901A\u8FC7 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> \u6279\u91CF\u9A73\u56DE </button><button class="admin-button-danger"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> \u6279\u91CF\u5220\u9664 </button></div></div><div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left"><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">\u9009\u62E9</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">\u8BC4\u8BBA</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">\u72B6\u6001</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">\u65F6\u95F4</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">\u64CD\u4F5C</th></tr></thead><tbody>`);
      if (unref(loading)) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="5"> \u6B63\u5728\u52A0\u8F7D\u8BC4\u8BBA... </td></tr>`);
      } else if (unref(items).length === 0) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="5"> \u6682\u65E0\u7B26\u5408\u7B5B\u9009\u6761\u4EF6\u7684\u8BC4\u8BBA\u3002 </td></tr>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(items), (comment) => {
          var _a;
          _push(`<tr class="${ssrRenderClass([{ "bg-blue-50/50": ((_a = unref(selectedComment)) == null ? void 0 : _a.id) === comment.id }, "border-b border-[var(--admin-border)] transition hover:bg-slate-50"])}"><td class="px-5 py-4"><input${ssrIncludeBooleanAttr(unref(selectedIds).includes(comment.id)) ? " checked" : ""} type="checkbox"></td><td class="px-5 py-4"><button class="block text-left" type="button"><p class="text-sm font-semibold text-slate-900">${ssrInterpolate(comment.nickname)}</p><p class="mt-1 line-clamp-2 text-sm leading-7 text-slate-500">${ssrInterpolate(comment.content)}</p><p class="mt-2 text-xs text-slate-400">${ssrInterpolate(comment.article.title)}</p></button></td><td class="px-5 py-4">`);
          _push(ssrRenderComponent(_component_AdminStatusBadge, {
            tone: comment.status === "approved" ? "success" : comment.status === "pending" ? "warning" : "danger"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(comment.status === "approved" ? "\u5DF2\u901A\u8FC7" : comment.status === "pending" ? "\u5F85\u5BA1\u6838" : "\u5DF2\u9A73\u56DE")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(comment.status === "approved" ? "\u5DF2\u901A\u8FC7" : comment.status === "pending" ? "\u5F85\u5BA1\u6838" : "\u5DF2\u9A73\u56DE"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-5 py-4 text-sm text-slate-500">${ssrInterpolate(new Date(comment.createdAt).toLocaleDateString("zh-CN"))}</td><td class="px-5 py-4"><button class="admin-button-secondary" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> \u67E5\u770B </button></td></tr>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</tbody></table></div>`);
      _push(ssrRenderComponent(_component_AdminPagination, {
        label: "\u8BC4\u8BBA\u5206\u9875",
        page: Math.min(unref(page), unref(totalPages)),
        total: unref(total),
        "total-pages": unref(totalPages),
        "onUpdate:page": unref(setPage)
      }, null, _parent));
      _push(`</div><div class="admin-card p-6">`);
      if (unref(selectedComment)) {
        _push(`<!--[--><div class="flex items-start justify-between gap-3"><div><p class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(selectedComment).nickname)}</p><p class="mt-1 text-sm text-slate-500">\u6765\u81EA ${ssrInterpolate(unref(selectedComment).article.title)}</p></div>`);
        _push(ssrRenderComponent(_component_AdminStatusBadge, {
          tone: unref(selectedComment).status === "approved" ? "success" : unref(selectedComment).status === "pending" ? "warning" : "danger"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(selectedComment).status === "approved" ? "\u5DF2\u901A\u8FC7" : unref(selectedComment).status === "pending" ? "\u5F85\u5BA1\u6838" : "\u5DF2\u9A73\u56DE")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(selectedComment).status === "approved" ? "\u5DF2\u901A\u8FC7" : unref(selectedComment).status === "pending" ? "\u5F85\u5BA1\u6838" : "\u5DF2\u9A73\u56DE"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mt-6 rounded-[4px] bg-slate-50 p-5"><p class="text-sm leading-8 text-slate-700">${ssrInterpolate(unref(selectedComment).content)}</p></div><div class="mt-6 space-y-3 text-sm text-slate-500"><p>\u521B\u5EFA\u65F6\u95F4: ${ssrInterpolate(new Date(unref(selectedComment).createdAt).toLocaleString("zh-CN"))}</p><p>\u90AE\u7BB1: ${ssrInterpolate(unref(selectedComment).email)}</p><p>\u7F51\u7AD9: ${ssrInterpolate(unref(selectedComment).website || "\u672A\u586B\u5199")}</p><p>\u56DE\u590D\u5C42\u7EA7: ${ssrInterpolate(unref(selectedComment).parent ? `\u56DE\u590D ${unref(selectedComment).parent.nickname}` : "\u4E00\u7EA7\u8BC4\u8BBA")}</p>`);
        if (unref(selectedComment).rejectReason) {
          _push(`<p>\u9A73\u56DE\u539F\u56E0: ${ssrInterpolate(unref(selectedComment).rejectReason)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-6 grid gap-3 sm:grid-cols-2"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> \u901A\u8FC7 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> \u8BBE\u4E3A\u5F85\u5BA1\u6838 </button><button class="admin-button-danger"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg> \u9A73\u56DE </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> \u5220\u9664 </button></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "mt-6 inline-flex text-sm font-medium text-blue-600 hover:underline",
          to: `/articles/${unref(selectedComment).article.slug}`,
          target: "_blank"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u6253\u5F00\u6587\u7AE0 `);
            } else {
              return [
                createTextVNode(" \u6253\u5F00\u6587\u7AE0 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<div class="flex h-full min-h-64 items-center justify-center text-sm text-slate-400"> \u8BF7\u9009\u62E9\u4E00\u6761\u8BC4\u8BBA\u67E5\u770B\u8BE6\u60C5 </div>`);
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/comments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=comments-CPtE70pL.mjs.map
