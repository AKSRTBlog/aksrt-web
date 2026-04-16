import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { _ as _sfc_main$2 } from "./AdminSearchField-D_EqVhFL.js";
import { _ as _sfc_main$3 } from "./AdminStatusBadge-BEmRWfoN.js";
import { ref, computed, defineComponent, mergeProps, withCtx, openBlock, createBlock, createVNode, createTextVNode, unref, isRef, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr } from "vue/server-renderer";
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
function useAdminFriendLinks() {
  const { adminApiFetch } = useAdminSession();
  const items = ref([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const applications = ref([]);
  const applicationsLoading = ref(false);
  const applicationKeyword = ref("");
  const applicationFilter = ref("all");
  const selectedApplicationId = ref(null);
  const reviewNote = ref("");
  const busyApplicationId = ref(null);
  const filteredApplications = computed(() => {
    const keyword = applicationKeyword.value.trim().toLowerCase();
    return applications.value.filter((item) => {
      if (applicationFilter.value !== "all" && item.status !== applicationFilter.value) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return [
        item.siteName,
        item.siteUrl,
        item.contactName,
        item.contactEmail,
        item.description,
        item.message ?? ""
      ].join(" ").toLowerCase().includes(keyword);
    });
  });
  const selectedApplication = computed(
    () => filteredApplications.value.find((item) => item.id === selectedApplicationId.value) ?? null
  );
  const counts = computed(() => ({
    all: applications.value.length,
    pending: applications.value.filter((item) => item.status === "pending").length,
    approved: applications.value.filter((item) => item.status === "approved").length,
    rejected: applications.value.filter((item) => item.status === "rejected").length
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
  function makeLinkItem() {
    return {
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `friend-link-${Date.now()}`,
      label: "",
      href: "",
      iconUrl: null,
      description: "",
      sortOrder: 0,
      enabled: true
    };
  }
  async function loadItems() {
    loading.value = true;
    try {
      const result = await adminApiFetch("/api/v1/admin/site-settings/footer-links");
      items.value = result.length > 0 ? result : [makeLinkItem()];
      showMessage("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "加载友链失败", true);
    } finally {
      loading.value = false;
    }
  }
  async function loadApplications() {
    applicationsLoading.value = true;
    try {
      const result = await adminApiFetch("/api/v1/admin/friend-link-applications");
      applications.value = result;
      if (selectedApplicationId.value && result.some((item) => item.id === selectedApplicationId.value)) {
      } else {
        selectedApplicationId.value = result[0]?.id ?? null;
      }
      showMessage("");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "加载申请失败", true);
    } finally {
      applicationsLoading.value = false;
    }
  }
  async function saveItems() {
    saving.value = true;
    try {
      const payload = items.value.filter((item) => item.label.trim() && item.href.trim()).map((item, index) => ({
        id: item.id,
        label: item.label.trim(),
        href: item.href.trim(),
        iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        description: item.description.trim(),
        sortOrder: index,
        enabled: item.enabled
      }));
      const result = await adminApiFetch("/api/v1/admin/site-settings/footer-links", {
        method: "PUT",
        body: JSON.stringify({ items: payload })
      });
      items.value = result.length > 0 ? result : [makeLinkItem()];
      showMessage("友情链接已保存");
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "保存失败", true);
    } finally {
      saving.value = false;
    }
  }
  function moveItem(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.value.length)
      return;
    const next = [...items.value];
    [next[index], next[targetIndex]] = [next[index], next[targetIndex]];
    items.value = next;
  }
  function removeItem(index) {
    let next = items.value.filter((_, i) => i !== index);
    if (next.length === 0) {
      next = [makeLinkItem()];
    }
    items.value = next;
  }
  async function handleReview(status) {
    if (!selectedApplication.value) {
      return;
    }
    busyApplicationId.value = selectedApplication.value.id;
    try {
      const result = await adminApiFetch(
        `/api/v1/admin/friend-link-applications/${selectedApplication.value.id}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            reviewNote: reviewNote.value.trim() ? reviewNote.value.trim() : null
          })
        }
      );
      applications.value = applications.value.map(
        (item) => item.id === result.id ? result : item
      );
      selectedApplicationId.value = result.id;
      reviewNote.value = result.reviewNote ?? "";
      await loadItems();
      showMessage(
        status === "approved" ? "申请已通过并同步到正式友链" : status === "rejected" ? "申请已驳回" : "申请已设为待审核"
      );
    } catch (e) {
      showMessage(e instanceof Error ? e.message : "审核失败", true);
    } finally {
      busyApplicationId.value = null;
    }
  }
  async function loadAll() {
    await Promise.all([loadItems(), loadApplications()]);
  }
  return {
    // 正式友链
    items,
    loading,
    saving,
    error,
    successMessage,
    // 申请
    applications,
    applicationsLoading,
    applicationKeyword,
    applicationFilter,
    selectedApplicationId,
    reviewNote,
    busyApplicationId,
    filteredApplications,
    selectedApplication,
    counts,
    // 工具函数
    makeLinkItem,
    // 方法
    loadItems,
    loadApplications,
    saveItems,
    moveItem,
    removeItem,
    handleReview,
    loadAll
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "friend-links",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "友情链接"
    });
    const {
      items,
      loading,
      saving,
      error,
      successMessage,
      applicationsLoading,
      applicationKeyword,
      applicationFilter,
      reviewNote,
      busyApplicationId,
      filteredApplications,
      selectedApplication,
      counts,
      loadAll,
      saveItems
    } = useAdminFriendLinks();
    function applicationStatusLabel(status) {
      return status === "approved" ? "已通过" : status === "rejected" ? "已驳回" : "待审核";
    }
    function applicationStatusTone(status) {
      return status === "approved" ? "success" : status === "rejected" ? "danger" : "warning";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminSearchField = _sfc_main$2;
      const _component_AdminStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "友情链接",
        description: "管理正式友情链接，并审核前台提交的友情链接申请。审核通过后会自动同步到前台友情链接页面和页脚。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/links",
              target: "_blank",
              class: "admin-button-secondary"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId2}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"${_scopeId2}></path></svg> 查看前台 `);
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
                    createTextVNode(" 查看前台 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(loading) || unref(applicationsLoading)) ? " disabled" : ""}${_scopeId}><svg class="${ssrRenderClass([{ "animate-spin": unref(loading) || unref(applicationsLoading) }, "h-4 w-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"${_scopeId}></path></svg> 刷新 </button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"${_scopeId}></path></svg> 保存正式友链 </button>`);
          } else {
            return [
              createVNode(_component_NuxtLink, {
                to: "/links",
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
                  createTextVNode(" 查看前台 ")
                ]),
                _: 1
              }),
              createVNode("button", {
                class: "admin-button-secondary",
                disabled: unref(loading) || unref(applicationsLoading),
                onClick: unref(loadAll)
              }, [
                (openBlock(), createBlock("svg", {
                  class: ["h-4 w-4", { "animate-spin": unref(loading) || unref(applicationsLoading) }],
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
                onClick: unref(saveItems)
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
                createTextVNode(" 保存正式友链 ")
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
      _push(`<section class="admin-card overflow-hidden p-0"><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><h3 class="text-base font-semibold text-slate-900">正式友链列表</h3><p class="text-sm text-slate-500">这里维护当前对外展示的友情链接。审核通过的申请也会自动同步到这一列表。</p></div><button class="admin-button-secondary"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> 添加友链 </button></div>`);
      if (unref(loading)) {
        _push(`<div class="px-5 py-6 text-sm text-slate-500"> 正在加载正式友链... </div>`);
      } else {
        _push(`<div class="divide-y divide-[var(--admin-border)]"><!--[-->`);
        ssrRenderList(unref(items), (item, index) => {
          _push(`<div class="flex gap-4 px-5 py-5 hover:bg-slate-50/50"><div class="flex flex-col gap-1 pt-1"><button${ssrIncludeBooleanAttr(index === 0) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="上移" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg></button><button${ssrIncludeBooleanAttr(index === unref(items).length - 1) ? " disabled" : ""} class="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" title="下移" type="button"><svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button></div><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">`);
          if (item.iconUrl) {
            _push(`<img${ssrRenderAttr("alt", item.label || "图标")}${ssrRenderAttr("src", item.iconUrl)} class="h-10 w-10 rounded-2xl object-cover">`);
          } else {
            _push(`<span>${ssrInterpolate(index + 1)}</span>`);
          }
          _push(`</div><div class="grid flex-1 gap-3 md:grid-cols-[1fr_1.3fr]"><input${ssrRenderAttr("value", item.label)} class="admin-input" placeholder="链接名称"><input${ssrRenderAttr("value", item.href)} class="admin-input" placeholder="例如 /pages/about 或 https://example.com"><input${ssrRenderAttr("value", item.iconUrl ?? "")} class="admin-input md:col-span-2" placeholder="图标地址，例如 https://example.com/logo.png"><textarea class="admin-input min-h-24 md:col-span-2" placeholder="友情链接简介，将显示在前台友情链接卡片中">${ssrInterpolate(item.description)}</textarea><div class="md:col-span-2 flex items-center justify-between gap-3"><div class="flex items-center gap-3"><button class="${ssrRenderClass(item.enabled ? "admin-switch admin-switch-on" : "admin-switch")}"${ssrRenderAttr("title", item.enabled ? "点击停用" : "点击启用")} type="button"><span class="admin-switch-thumb"></span></button><span class="text-sm text-slate-500">启用后会显示在页脚和友情链接页</span></div><button class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" title="删除" type="button"><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section><div class="admin-card p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(applicationKeyword),
        "onUpdate:modelValue": ($event) => isRef(applicationKeyword) ? applicationKeyword.value = $event : null,
        placeholder: "搜索站点名称、地址、联系人或邮箱"
      }, null, _parent));
      _push(`<div class="flex flex-wrap gap-2"><button class="${ssrRenderClass(unref(applicationFilter) === "all" ? "admin-button-primary" : "admin-button-secondary")}"> 全部 ${ssrInterpolate(unref(counts).all)}</button><button class="${ssrRenderClass(unref(applicationFilter) === "pending" ? "admin-button-primary" : "admin-button-secondary")}"> 待审核 ${ssrInterpolate(unref(counts).pending)}</button><button class="${ssrRenderClass(unref(applicationFilter) === "approved" ? "admin-button-primary" : "admin-button-secondary")}"> 已通过 ${ssrInterpolate(unref(counts).approved)}</button><button class="${ssrRenderClass(unref(applicationFilter) === "rejected" ? "admin-button-primary" : "admin-button-secondary")}"> 已驳回 ${ssrInterpolate(unref(counts).rejected)}</button></div></div></div><section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"><div class="admin-card overflow-hidden"><div class="flex items-center justify-between gap-3 border-b border-[var(--admin-border)] px-5 py-4"><div><p class="text-sm font-semibold text-slate-900">申请审核队列</p><p class="text-xs text-slate-500">共 ${ssrInterpolate(unref(filteredApplications).length)} 条符合当前筛选条件</p></div><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(applicationsLoading)) ? " disabled" : ""}><svg class="${ssrRenderClass([{ "animate-spin": unref(applicationsLoading) }, "h-4 w-4"])}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg> 刷新申请 </button></div><div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left"><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">站点</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">状态</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">联系人</th><th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">提交时间</th></tr></thead><tbody>`);
      if (unref(applicationsLoading)) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="4"> 正在加载申请记录... </td></tr>`);
      } else if (unref(filteredApplications).length === 0) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="4"> 当前没有符合筛选条件的友情链接申请。 </td></tr>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(filteredApplications), (item) => {
          _push(`<tr class="${ssrRenderClass([{ "bg-blue-50/50": unref(selectedApplication)?.id === item.id }, "cursor-pointer border-b border-[var(--admin-border)] transition hover:bg-slate-50"])}"><td class="px-5 py-4"><div class="flex items-center gap-3"><div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-semibold text-slate-600">`);
          if (item.iconUrl) {
            _push(`<img${ssrRenderAttr("alt", item.siteName)}${ssrRenderAttr("src", item.iconUrl)} class="h-10 w-10 rounded-2xl object-cover">`);
          } else {
            _push(`<span>${ssrInterpolate(item.siteName.slice(0, 1).toUpperCase())}</span>`);
          }
          _push(`</div><div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900">${ssrInterpolate(item.siteName)}</p><p class="truncate text-sm text-slate-500">${ssrInterpolate(item.siteUrl)}</p></div></div></td><td class="px-5 py-4">`);
          _push(ssrRenderComponent(_component_AdminStatusBadge, {
            tone: applicationStatusTone(item.status)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(applicationStatusLabel(item.status))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(applicationStatusLabel(item.status)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-5 py-4 text-sm text-slate-500"><p>${ssrInterpolate(item.contactName)}</p><p class="mt-1 text-xs text-slate-400">${ssrInterpolate(item.contactEmail)}</p></td><td class="px-5 py-4 text-sm text-slate-500">${ssrInterpolate(new Date(item.createdAt).toLocaleDateString("zh-CN"))}</td></tr>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</tbody></table></div></div><div class="admin-card p-6">`);
      if (unref(selectedApplication)) {
        _push(`<!--[--><div class="flex items-start justify-between gap-3"><div class="flex items-center gap-4"><div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-slate-100 text-lg font-semibold text-slate-600">`);
        if (unref(selectedApplication).iconUrl) {
          _push(`<img${ssrRenderAttr("alt", unref(selectedApplication).siteName)}${ssrRenderAttr("src", unref(selectedApplication).iconUrl)} class="h-14 w-14 rounded-3xl object-cover">`);
        } else {
          _push(`<span>${ssrInterpolate(unref(selectedApplication).siteName.slice(0, 1).toUpperCase())}</span>`);
        }
        _push(`</div><div><p class="text-lg font-semibold text-slate-900">${ssrInterpolate(unref(selectedApplication).siteName)}</p><a${ssrRenderAttr("href", unref(selectedApplication).siteUrl)} target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex text-sm text-blue-600 hover:underline"><svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg> 打开站点 </a></div></div>`);
        _push(ssrRenderComponent(_component_AdminStatusBadge, {
          tone: applicationStatusTone(unref(selectedApplication).status)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(applicationStatusLabel(unref(selectedApplication).status))}`);
            } else {
              return [
                createTextVNode(toDisplayString(applicationStatusLabel(unref(selectedApplication).status)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="mt-6 rounded-[4px] bg-slate-50 p-5"><p class="text-sm font-medium text-slate-900">站点简介</p><p class="mt-2 text-sm leading-7 text-slate-600">${ssrInterpolate(unref(selectedApplication).description)}</p></div>`);
        if (unref(selectedApplication).message) {
          _push(`<div class="mt-4 rounded-[4px] border border-[var(--admin-border)] p-5"><p class="text-sm font-medium text-slate-900">补充说明</p><p class="mt-2 text-sm leading-7 text-slate-600">${ssrInterpolate(unref(selectedApplication).message)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-6 space-y-3 text-sm text-slate-500"><p>联系人: ${ssrInterpolate(unref(selectedApplication).contactName)}</p><p>邮箱: ${ssrInterpolate(unref(selectedApplication).contactEmail)}</p><p>提交时间: ${ssrInterpolate(new Date(unref(selectedApplication).createdAt).toLocaleString("zh-CN"))}</p><p>最后更新: ${ssrInterpolate(new Date(unref(selectedApplication).updatedAt).toLocaleString("zh-CN"))}</p><p>审核时间: ${ssrInterpolate(unref(selectedApplication).reviewedAt ? new Date(unref(selectedApplication).reviewedAt).toLocaleString("zh-CN") : "尚未审核")}</p><p>同步状态: ${ssrInterpolate(unref(selectedApplication).linkedFooterLinkId ? "已同步正式友链" : "尚未同步")}</p></div><div class="mt-6"><label class="mb-2 block text-sm font-medium text-slate-700">审核备注</label><textarea class="admin-input min-h-28" placeholder="可填写审核说明、互换要求或驳回原因">${ssrInterpolate(unref(reviewNote))}</textarea></div><div class="mt-6 grid gap-3 sm:grid-cols-3"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(busyApplicationId) === unref(selectedApplication).id) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> 通过并同步 </button><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(busyApplicationId) === unref(selectedApplication).id) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 设为待审核 </button><button class="admin-button-danger"${ssrIncludeBooleanAttr(unref(busyApplicationId) === unref(selectedApplication).id) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 驳回申请 </button></div><div class="mt-6 rounded-[4px] border border-dashed border-[var(--admin-border)] px-4 py-3 text-sm text-slate-500"> 通过后会自动创建或启用对应正式友链；设为待审核或驳回后，会自动停用对应正式友链展示。 </div><!--]-->`);
      } else {
        _push(`<div class="flex h-full min-h-64 items-center justify-center text-sm text-slate-400"> 请选择一条友情链接申请查看详情。 </div>`);
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/friend-links.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=friend-links-CbR9MqnZ.js.map
