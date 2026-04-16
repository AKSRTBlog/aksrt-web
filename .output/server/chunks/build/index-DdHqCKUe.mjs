import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { _ as _sfc_main$2 } from './AdminSearchField-D_EqVhFL.mjs';
import { _ as _sfc_main$3 } from './AdminStatusBadge-BEmRWfoN.mjs';
import { _ as _sfc_main$4 } from './AdminPagination-BcT-QBcs.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, unref, createTextVNode, createVNode, isRef, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { u as useAdminSession, A as AdminApiError } from './useAdminSession-fnHBOwsd.mjs';
import { a as adminPaths, b as formatAdminDate } from './admin-BhXx1q9A.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { n as navigateTo } from './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './api-base-COxdl8qP.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const PAGE_SIZE = 6;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Admin Articles"
    });
    const { adminApiFetch, logout, hydrateSession } = useAdminSession();
    const items = ref([]);
    const options = ref({ categories: [], tags: [] });
    const keyword = ref("");
    const status = ref("all");
    const categoryId = ref("all");
    const page = ref(1);
    const total = ref(0);
    const loading = ref(true);
    const errorMessage = ref("");
    const busyId = ref(null);
    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)));
    function buildArticleListPath() {
      const params = new URLSearchParams({
        page: String(page.value),
        pageSize: String(PAGE_SIZE),
        sortBy: "updatedAt",
        sortOrder: "desc"
      });
      if (keyword.value.trim()) {
        params.set("keyword", keyword.value.trim());
      }
      if (status.value !== "all") {
        params.set("status", status.value);
      }
      if (categoryId.value !== "all") {
        params.set("categoryId", categoryId.value);
      }
      return `/api/v1/admin/articles?${params.toString()}`;
    }
    async function loadArticles() {
      loading.value = true;
      errorMessage.value = "";
      hydrateSession();
      try {
        const [articleResult, optionResult] = await Promise.all([
          adminApiFetch(buildArticleListPath()),
          adminApiFetch("/api/v1/admin/articles/meta/options")
        ]);
        items.value = articleResult.list;
        total.value = articleResult.total;
        options.value = optionResult;
      } catch (error) {
        if (error instanceof AdminApiError && error.status === 401) {
          logout();
          await navigateTo(adminPaths.login);
          return;
        }
        errorMessage.value = error instanceof Error ? error.message : "\u6587\u7AE0\u5217\u8868\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002";
      } finally {
        loading.value = false;
      }
    }
    watch([page, keyword, status, categoryId], async () => {
      await loadArticles();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminSearchField = _sfc_main$2;
      const _component_AdminStatusBadge = _sfc_main$3;
      const _component_AdminPagination = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u6587\u7AE0\u7BA1\u7406",
        description: "\u5728\u8FD9\u91CC\u6D4F\u89C8\u771F\u5B9E\u6587\u7AE0\u6570\u636E\uFF0C\u6309\u5173\u952E\u8BCD\u3001\u72B6\u6001\u548C\u5206\u7C7B\u7B5B\u9009\uFF0C\u5E76\u8FDB\u5165\u7F16\u8F91\u6216\u5220\u9664\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-primary",
              to: unref(adminPaths).articleCreate
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u65B0\u5EFA\u6587\u7AE0`);
                } else {
                  return [
                    createTextVNode("\u65B0\u5EFA\u6587\u7AE0")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                class: "admin-button-primary",
                to: unref(adminPaths).articleCreate
              }, {
                default: withCtx(() => [
                  createTextVNode("\u65B0\u5EFA\u6587\u7AE0")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="rounded-lg border border-[var(--admin-border)] bg-white p-4"><div class="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">`);
      _push(ssrRenderComponent(_component_AdminSearchField, {
        modelValue: unref(keyword),
        "onUpdate:modelValue": [($event) => isRef(keyword) ? keyword.value = $event : null, ($event) => page.value = 1],
        placeholder: "\u641C\u7D22\u6807\u9898\u6216\u6458\u8981"
      }, null, _parent));
      _push(`<div class="flex flex-wrap gap-2"><select class="admin-select w-auto min-w-36"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "all") : ssrLooseEqual(unref(status), "all")) ? " selected" : ""}>\u5168\u90E8\u72B6\u6001</option><option value="published"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "published") : ssrLooseEqual(unref(status), "published")) ? " selected" : ""}>\u5DF2\u53D1\u5E03</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "draft") : ssrLooseEqual(unref(status), "draft")) ? " selected" : ""}>\u8349\u7A3F</option></select><select class="admin-select w-auto min-w-40"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(categoryId)) ? ssrLooseContain(unref(categoryId), "all") : ssrLooseEqual(unref(categoryId), "all")) ? " selected" : ""}>\u5168\u90E8\u5206\u7C7B</option><!--[-->`);
      ssrRenderList(unref(options).categories, (item) => {
        _push(`<option${ssrRenderAttr("value", item.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(categoryId)) ? ssrLooseContain(unref(categoryId), item.id) : ssrLooseEqual(unref(categoryId), item.id)) ? " selected" : ""}>${ssrInterpolate(item.name)}</option>`);
      });
      _push(`<!--]--></select></div></div></div>`);
      if (unref(errorMessage)) {
        _push(`<div class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">${ssrInterpolate(unref(errorMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="admin-card overflow-hidden"><div class="overflow-x-auto"><table class="w-full border-collapse"><thead><tr class="border-b border-[var(--admin-border)] bg-slate-50/90 text-left"><!--[-->`);
      ssrRenderList(["\u6587\u7AE0", "\u5206\u7C7B", "\u72B6\u6001", "\u53D1\u5E03\u65F6\u95F4", "\u66F4\u65B0\u65F6\u95F4", "\u64CD\u4F5C"], (label) => {
        _push(`<th class="px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">${ssrInterpolate(label)}</th>`);
      });
      _push(`<!--]--></tr></thead><tbody>`);
      if (unref(loading)) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="6"> \u6B63\u5728\u52A0\u8F7D\u6587\u7AE0\u6570\u636E... </td></tr>`);
      } else if (unref(items).length === 0) {
        _push(`<tr><td class="px-5 py-10 text-sm text-slate-400" colspan="6"> \u5F53\u524D\u7B5B\u9009\u6761\u4EF6\u4E0B\u8FD8\u6CA1\u6709\u6587\u7AE0\u3002 </td></tr>`);
      } else {
        _push(`<!--[-->`);
        ssrRenderList(unref(items), (article) => {
          _push(`<tr class="border-b border-[var(--admin-border)] transition hover:bg-slate-50"><td class="px-5 py-4"><div class="flex min-w-[260px] items-center gap-4">`);
          if (article.coverImageUrl) {
            _push(`<img class="h-14 w-14 rounded-[4px] object-cover"${ssrRenderAttr("src", article.coverImageUrl)}${ssrRenderAttr("alt", article.title)}>`);
          } else {
            _push(`<div class="flex h-14 w-14 items-center justify-center rounded-[4px] bg-slate-100 text-xs text-slate-400"> \u65E0\u5C01\u9762 </div>`);
          }
          _push(`<div class="min-w-0"><p class="truncate text-sm font-semibold text-slate-900">${ssrInterpolate(article.title)}</p><p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">${ssrInterpolate(article.excerpt)}</p></div></div></td><td class="px-5 py-4 text-sm text-slate-600">${ssrInterpolate(article.categories && article.categories.length > 0 ? article.categories.map((cat) => cat.name).join(", ") : "\u672A\u5206\u7C7B")}</td><td class="px-5 py-4">`);
          _push(ssrRenderComponent(_component_AdminStatusBadge, {
            tone: article.status === "published" ? "success" : "warning"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(article.status === "published" ? "\u5DF2\u53D1\u5E03" : "\u8349\u7A3F")}`);
              } else {
                return [
                  createTextVNode(toDisplayString(article.status === "published" ? "\u5DF2\u53D1\u5E03" : "\u8349\u7A3F"), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td><td class="px-5 py-4 text-sm text-slate-600">${ssrInterpolate(article.publishedAt ? unref(formatAdminDate)(article.publishedAt) : "\u672A\u53D1\u5E03")}</td><td class="px-5 py-4 text-sm text-slate-600">${ssrInterpolate(unref(formatAdminDate)(article.updatedAt))}</td><td class="px-5 py-4"><div class="flex flex-wrap gap-2">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "admin-button-secondary",
            to: `/articles/${article.slug}`,
            target: "_blank"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u9884\u89C8 `);
              } else {
                return [
                  createTextVNode(" \u9884\u89C8 ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "admin-button-secondary",
            to: unref(adminPaths).articleEdit(article.id)
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u7F16\u8F91 `);
              } else {
                return [
                  createTextVNode(" \u7F16\u8F91 ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="admin-button-danger" type="button"${ssrIncludeBooleanAttr(unref(busyId) === article.id) ? " disabled" : ""}>${ssrInterpolate(unref(busyId) === article.id ? "\u5220\u9664\u4E2D..." : "\u5220\u9664")}</button></div></td></tr>`);
        });
        _push(`<!--]-->`);
      }
      _push(`</tbody></table></div>`);
      _push(ssrRenderComponent(_component_AdminPagination, {
        page: Math.min(unref(page), unref(totalPages)),
        total: unref(total),
        "total-pages": unref(totalPages),
        label: "\u7BC7\u6587\u7AE0",
        "onUpdate:page": ($event) => page.value = $event
      }, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/articles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DdHqCKUe.mjs.map
