import { _ as _sfc_main$2 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, ref, reactive, computed, mergeProps, withCtx, unref, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$3 } from './AdminStatusBadge-BEmRWfoN.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import { f as formatAdminNumber, a as adminPaths, b as formatAdminDate } from './admin-BhXx1q9A.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminStatCard",
  __ssrInlineRender: true,
  props: {
    marker: {},
    label: {},
    value: {},
    change: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-card p-5" }, _attrs))}><div class="flex items-start justify-between gap-3"><div class="admin-icon-chip text-sm font-semibold">${ssrInterpolate(__props.marker)}</div>`);
      if (__props.change) {
        _push(`<span class="admin-badge admin-badge-success">${ssrInterpolate(__props.change)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><p class="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-900">${ssrInterpolate(__props.value)}</p><p class="mt-2 text-sm text-slate-500">${ssrInterpolate(__props.label)}</p></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminStatCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Admin Dashboard"
    });
    useAdminSession();
    const loading = ref(true);
    const errorMessage = ref("");
    const dashboardState = reactive({
      articles: [],
      comments: [],
      media: [],
      profile: null
    });
    const metrics = computed(() => {
      const publishedArticles = dashboardState.articles.filter((item) => item.status === "published").length;
      const draftArticles = dashboardState.articles.filter((item) => item.status === "draft").length;
      const pendingComments = dashboardState.comments.filter((item) => item.status === "pending").length;
      const activeMedia = dashboardState.media.filter((item) => item.status === "active").length;
      return [
        { marker: "\u6587", label: "\u6587\u7AE0\u603B\u6570", value: formatAdminNumber(dashboardState.articles.length), change: `${publishedArticles} \u5DF2\u53D1\u5E03` },
        { marker: "\u53D1", label: "\u5DF2\u53D1\u5E03\u6587\u7AE0", value: formatAdminNumber(publishedArticles), change: `${draftArticles} \u8349\u7A3F` },
        { marker: "\u8BC4", label: "\u5F85\u5BA1\u6838\u8BC4\u8BBA", value: formatAdminNumber(pendingComments), change: "\u9700\u8981\u5904\u7406" },
        { marker: "\u5A92", label: "\u5A92\u4F53\u8D44\u6E90", value: formatAdminNumber(activeMedia), change: `${dashboardState.media.length} \u603B\u8BA1` }
      ];
    });
    const recentArticles = computed(
      () => [...dashboardState.articles].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 5)
    );
    const recentComments = computed(
      () => [...dashboardState.comments].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 5)
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminStatCard = _sfc_main$1;
      const _component_AdminStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u4EEA\u8868\u76D8",
        description: "\u67E5\u770B\u6587\u7AE0\u3001\u8BC4\u8BBA\u548C\u5A92\u4F53\u8D44\u6E90\u7684\u6700\u65B0\u72B6\u6001\u3002"
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
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: unref(adminPaths).media
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u4E0A\u4F20\u5A92\u4F53`);
                } else {
                  return [
                    createTextVNode("\u4E0A\u4F20\u5A92\u4F53")
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
              }, 8, ["to"]),
              createVNode(_component_NuxtLink, {
                class: "admin-button-secondary",
                to: unref(adminPaths).media
              }, {
                default: withCtx(() => [
                  createTextVNode("\u4E0A\u4F20\u5A92\u4F53")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loading)) {
        _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-white/80 px-5 py-8 text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u4EEA\u8868\u76D8\u6570\u636E... </div>`);
      } else if (unref(errorMessage)) {
        _push(`<div class="rounded-[4px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-600">${ssrInterpolate(unref(errorMessage))}</div>`);
      } else {
        _push(`<!--[--><section class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><!--[-->`);
        ssrRenderList(unref(metrics), (item) => {
          _push(ssrRenderComponent(_component_AdminStatCard, {
            key: item.label,
            marker: item.marker,
            label: item.label,
            value: item.value,
            change: item.change
          }, null, _parent));
        });
        _push(`<!--]--></section><section class="grid gap-6 xl:grid-cols-2"><div class="space-y-6"><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">\u5FEB\u6377\u5165\u53E3</h3><span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Shortcuts</span></div><div class="grid gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "rounded-[4px] border border-[var(--admin-border)] px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50",
          to: unref(adminPaths).comments
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>\u8BC4\u8BBA\u7BA1\u7406</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>\u5BA1\u6838\u3001\u901A\u8FC7\u6216\u5904\u7406\u6700\u65B0\u8BC4\u8BBA\u3002</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "\u8BC4\u8BBA\u7BA1\u7406"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "\u5BA1\u6838\u3001\u901A\u8FC7\u6216\u5904\u7406\u6700\u65B0\u8BC4\u8BBA\u3002")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "rounded-[4px] border border-[var(--admin-border)] px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50",
          to: unref(adminPaths).banners
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>Banner \u7BA1\u7406</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>\u7EF4\u62A4\u9996\u9875\u4E0E\u4FA7\u8FB9\u680F\u7684\u5C55\u793A\u5185\u5BB9\u3002</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "Banner \u7BA1\u7406"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "\u7EF4\u62A4\u9996\u9875\u4E0E\u4FA7\u8FB9\u680F\u7684\u5C55\u793A\u5185\u5BB9\u3002")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "rounded-[4px] border border-[var(--admin-border)] px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50",
          to: unref(adminPaths).settings
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>\u7AD9\u70B9\u8BBE\u7F6E</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>\u4FEE\u6539 SEO\u3001SMTP \u4E0E\u5B58\u50A8\u914D\u7F6E\u3002</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "\u7AD9\u70B9\u8BBE\u7F6E"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "\u4FEE\u6539 SEO\u3001SMTP \u4E0E\u5B58\u50A8\u914D\u7F6E\u3002")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">\u540E\u53F0\u6982\u89C8</h3><span class="text-sm text-slate-500">${ssrInterpolate(((_a = unref(dashboardState).profile) == null ? void 0 : _a.displayName) || ((_b = unref(dashboardState).profile) == null ? void 0 : _b.username) || "\u7BA1\u7406\u5458")}</span></div><div class="space-y-4"><div class="rounded-[4px] border border-[var(--admin-border)] px-4 py-4"><p class="text-xs text-slate-500">\u767B\u5F55\u8D26\u53F7</p><p class="mt-1 text-sm font-medium text-slate-900">${ssrInterpolate(((_c = unref(dashboardState).profile) == null ? void 0 : _c.email) || "\u672A\u83B7\u53D6\u5230\u90AE\u7BB1")}</p></div><div class="rounded-[4px] border border-[var(--admin-border)] px-4 py-4"><p class="text-xs text-slate-500">\u6700\u540E\u767B\u5F55</p><p class="mt-1 text-sm font-medium text-slate-900">${ssrInterpolate(((_d = unref(dashboardState).profile) == null ? void 0 : _d.lastLoginAt) ? unref(formatAdminDate)(unref(dashboardState).profile.lastLoginAt) : "\u6682\u65E0\u8BB0\u5F55")}</p></div></div></div></div><div class="space-y-6"><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">\u6700\u65B0\u6587\u7AE0</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "text-sm font-medium text-blue-600",
          to: unref(adminPaths).articles
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u67E5\u770B\u5168\u90E8`);
            } else {
              return [
                createTextVNode("\u67E5\u770B\u5168\u90E8")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(recentArticles).length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(recentArticles), (article) => {
            var _a2, _b2;
            _push(`<div class="flex items-center gap-4 rounded-[4px] border border-[var(--admin-border)] px-4 py-3"><div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-slate-900">${ssrInterpolate(article.title)}</p><p class="mt-1 text-xs text-slate-500">${ssrInterpolate(((_b2 = (_a2 = article.categories) == null ? void 0 : _a2[0]) == null ? void 0 : _b2.name) || "\u672A\u5206\u7C7B")} \xB7 ${ssrInterpolate(unref(formatAdminDate)(article.createdAt))}</p></div>`);
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
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5"><p class="text-sm font-semibold text-slate-900">\u6682\u65E0\u6587\u7AE0</p><p class="mt-1 text-sm text-slate-500">\u5148\u521B\u5EFA\u7B2C\u4E00\u7BC7\u6587\u7AE0\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u6700\u8FD1\u66F4\u65B0\u3002</p></div>`);
        }
        _push(`</div><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">\u6700\u65B0\u8BC4\u8BBA</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "text-sm font-medium text-blue-600",
          to: unref(adminPaths).comments
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u67E5\u770B\u5168\u90E8`);
            } else {
              return [
                createTextVNode("\u67E5\u770B\u5168\u90E8")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(recentComments).length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(recentComments), (comment) => {
            _push(`<div class="rounded-[4px] border border-[var(--admin-border)] px-4 py-4"><div class="flex items-center justify-between gap-3"><p class="text-sm font-semibold text-slate-900">${ssrInterpolate(comment.nickname)}</p>`);
            _push(ssrRenderComponent(_component_AdminStatusBadge, {
              tone: comment.status === "approved" ? "success" : comment.status === "pending" ? "warning" : "danger"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(comment.status)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(comment.status), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div><p class="mt-2 line-clamp-3 text-sm text-slate-500">${ssrInterpolate(comment.content)}</p><p class="mt-2 text-xs text-slate-400">${ssrInterpolate(unref(formatAdminDate)(comment.createdAt))}</p></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5"><p class="text-sm font-semibold text-slate-900">\u6682\u65E0\u8BC4\u8BBA</p><p class="mt-1 text-sm text-slate-500">\u6709\u65B0\u8BC4\u8BBA\u540E\uFF0C\u8FD9\u91CC\u4F1A\u663E\u793A\u6700\u8FD1\u7559\u8A00\u3002</p></div>`);
        }
        _push(`</div></div></section><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DJz0Pewt.mjs.map
