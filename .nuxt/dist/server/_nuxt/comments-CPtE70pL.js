import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as _sfc_main$2 } from "./AdminSearchField-D_EqVhFL.js";
import { _ as _sfc_main$3 } from "./AdminStatusBadge-BEmRWfoN.js";
import { _ as _sfc_main$4 } from "./AdminPagination-BcT-QBcs.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { ref, computed, defineComponent, watch, mergeProps, isRef, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList } from "vue/server-renderer";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "./api-base-COxdl8qP.js";
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
      error.value = e instanceof Error ? e.message : "加载评论失败";
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
            rejectReason: rejectReason ?? null
          })
        }
      );
      syncItem(result);
      await reloadComments();
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "审核评论失败";
      return null;
    } finally {
      busyId.value = null;
    }
  }
  async function deleteComment(comment) {
    if (!confirm("确认删除这条评论吗？删除后无法恢复。")) {
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
      error.value = e instanceof Error ? e.message : "删除评论失败";
      return false;
    } finally {
      busyId.value = null;
    }
  }
  async function runBulkAction(action, targetIds) {
    const targets = targetIds ?? selectedIds.value;
    if (targets.length === 0) {
      return;
    }
    if (action === "delete") {
      if (!confirm(`确认删除选中的 ${targets.length} 条评论吗？`)) {
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
              rejectReason: action === "rejected" ? "批量驳回" : null
            })
          })
        )
      );
      results.forEach(syncItem);
      await reloadComments();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "批量操作失败";
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
      title: "评论管理"
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
      () => items.value.find((item) => item.id === selectedId.value) ?? items.value[0] ?? null
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
        title: "评论管理",
        description: "按状态筛选评论，并支持单条或批量审核。"
      }, null, _parent));
      _push(`<div class="admin-card p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(keyword),
        "onUpdate:modelValue": [($event) => isRef(keyword) ? keyword.value = $event : null, handleKeywordChange],
        placeholder: "搜索昵称、内容或文章标题"
      }, null, _parent));
      _push(`<div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "all" }, "admin-button-secondary"])}"> 全部 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "pending" }, "admin-button-secondary"])}"> 待审核 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "approved" }, "admin-button-secondary"])}"> 已通过 </button><button class="${ssrRenderClass([{ "admin-button-primary": unref(status) === "rejected" }, "admin-button-secondary"])}"> 已驳回 </button></div></div></div>`);
      if (unref(error)) {
        _push(`<div class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"><div class="admin-card overflow-hidden"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-sm font-semibold text-slate-900">当前页 ${ssrInterpolate(unref(items).length)} 条</p><p class="text-xs text-slate-500">${ssrInterpolate(unref(pendingCount))} 条待审核</p></div><div class="flex flex-wrap gap-2"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading) || unref(items).length === 0) ? " disabled" : ""}>${ssrInterpolate(unref(allVisibleSelected) ? "取消本页全选" : "本页全选")}</button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 批量通过 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> 批量驳回 </button><button class="admin-button-danger"${ssrIncludeBooleanAttr(unref(loading) || unref(selectedIds).length === 0 || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 批量删除 </button></div></div><div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left"><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">选择</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">评论</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">状态</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">时间</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">操作</th></tr></thead><tbody>`);
      if (unref(loading)) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="5"> 正在加载评论... </td></tr>`);
      } else if (unref(items).length === 0) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="5"> 暂无符合筛选条件的评论。 </td></tr>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(items), (comment) => {
          _push(`<tr class="${ssrRenderClass([{ "bg-blue-50/50": unref(selectedComment)?.id === comment.id }, "border-b border-[var(--admin-border)] transition hover:bg-slate-50"])}"><td class="px-5 py-4"><input${ssrIncludeBooleanAttr(unref(selectedIds).includes(comment.id)) ? " checked" : ""} type="checkbox"></td><td class="px-5 py-4"><button class="block text-left" type="button"><p class="text-sm font-semibold text-slate-900">${ssrInterpolate(comment.nickname)}</p><p class="mt-1 line-clamp-2 text-sm leading-7 text-slate-500">${ssrInterpolate(comment.content)}</p><p class="mt-2 text-xs text-slate-400">${ssrInterpolate(comment.article.title)}</p></button></td><td class="px-5 py-4">`);
          _push(ssrRenderComponent(_component_AdminStatusBadge, {
            tone: comment.status === "approved" ? "success" : comment.status === "pending" ? "warning" : "danger"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(comment.status === "approved" ? "已通过" : comment.status === "pending" ? "待审核" : "已驳回")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(comment.status === "approved" ? "已通过" : comment.status === "pending" ? "待审核" : "已驳回"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-5 py-4 text-sm text-slate-500">${ssrInterpolate(new Date(comment.createdAt).toLocaleDateString("zh-CN"))}</td><td class="px-5 py-4"><button class="admin-button-secondary" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> 查看 </button></td></tr>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</tbody></table></div>`);
      _push(ssrRenderComponent(_component_AdminPagination, {
        label: "评论分页",
        page: Math.min(unref(page), unref(totalPages)),
        total: unref(total),
        "total-pages": unref(totalPages),
        "onUpdate:page": unref(setPage)
      }, null, _parent));
      _push(`</div><div class="admin-card p-6">`);
      if (unref(selectedComment)) {
        _push(`<!--[--><div class="flex items-start justify-between gap-3"><div><p class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(selectedComment).nickname)}</p><p class="mt-1 text-sm text-slate-500">来自 ${ssrInterpolate(unref(selectedComment).article.title)}</p></div>`);
        _push(ssrRenderComponent(_component_AdminStatusBadge, {
          tone: unref(selectedComment).status === "approved" ? "success" : unref(selectedComment).status === "pending" ? "warning" : "danger"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(unref(selectedComment).status === "approved" ? "已通过" : unref(selectedComment).status === "pending" ? "待审核" : "已驳回")}`);
            } else {
              return [
                createTextVNode(toDisplayString(unref(selectedComment).status === "approved" ? "已通过" : unref(selectedComment).status === "pending" ? "待审核" : "已驳回"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mt-6 rounded-[4px] bg-slate-50 p-5"><p class="text-sm leading-8 text-slate-700">${ssrInterpolate(unref(selectedComment).content)}</p></div><div class="mt-6 space-y-3 text-sm text-slate-500"><p>创建时间: ${ssrInterpolate(new Date(unref(selectedComment).createdAt).toLocaleString("zh-CN"))}</p><p>邮箱: ${ssrInterpolate(unref(selectedComment).email)}</p><p>网站: ${ssrInterpolate(unref(selectedComment).website || "未填写")}</p><p>回复层级: ${ssrInterpolate(unref(selectedComment).parent ? `回复 ${unref(selectedComment).parent.nickname}` : "一级评论")}</p>`);
        if (unref(selectedComment).rejectReason) {
          _push(`<p>驳回原因: ${ssrInterpolate(unref(selectedComment).rejectReason)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-6 grid gap-3 sm:grid-cols-2"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 通过 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> 设为待审核 </button><button class="admin-button-danger"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg> 驳回 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(busyId) === unref(selectedComment).id || unref(busyId) === "bulk") ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg> 删除 </button></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "mt-6 inline-flex text-sm font-medium text-blue-600 hover:underline",
          to: `/articles/${unref(selectedComment).article.slug}`,
          target: "_blank"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` 打开文章 `);
            } else {
              return [
                createTextVNode(" 打开文章 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<div class="flex h-full min-h-64 items-center justify-center text-sm text-slate-400"> 请选择一条评论查看详情 </div>`);
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
export {
  _sfc_main as default
};
//# sourceMappingURL=comments-CPtE70pL.js.map
