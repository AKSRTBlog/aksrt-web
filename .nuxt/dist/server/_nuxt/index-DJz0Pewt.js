import { _ as _sfc_main$2 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { defineComponent, mergeProps, useSSRContext, ref, reactive, computed, withCtx, unref, createTextVNode, createVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from "vue/server-renderer";
import { _ as _sfc_main$3 } from "./AdminStatusBadge-BEmRWfoN.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import { f as formatAdminNumber, a as adminPaths, b as formatAdminDate } from "./admin-BhXx1q9A.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
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
        { marker: "文", label: "文章总数", value: formatAdminNumber(dashboardState.articles.length), change: `${publishedArticles} 已发布` },
        { marker: "发", label: "已发布文章", value: formatAdminNumber(publishedArticles), change: `${draftArticles} 草稿` },
        { marker: "评", label: "待审核评论", value: formatAdminNumber(pendingComments), change: "需要处理" },
        { marker: "媒", label: "媒体资源", value: formatAdminNumber(activeMedia), change: `${dashboardState.media.length} 总计` }
      ];
    });
    const recentArticles = computed(
      () => [...dashboardState.articles].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 5)
    );
    const recentComments = computed(
      () => [...dashboardState.comments].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, 5)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminStatCard = _sfc_main$1;
      const _component_AdminStatusBadge = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "仪表盘",
        description: "查看文章、评论和媒体资源的最新状态。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-primary",
              to: unref(adminPaths).articleCreate
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`新建文章`);
                } else {
                  return [
                    createTextVNode("新建文章")
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
                  _push3(`上传媒体`);
                } else {
                  return [
                    createTextVNode("上传媒体")
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
                  createTextVNode("新建文章")
                ]),
                _: 1
              }, 8, ["to"]),
              createVNode(_component_NuxtLink, {
                class: "admin-button-secondary",
                to: unref(adminPaths).media
              }, {
                default: withCtx(() => [
                  createTextVNode("上传媒体")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loading)) {
        _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-white/80 px-5 py-8 text-sm text-slate-500"> 正在加载仪表盘数据... </div>`);
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
        _push(`<!--]--></section><section class="grid gap-6 xl:grid-cols-2"><div class="space-y-6"><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">快捷入口</h3><span class="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Shortcuts</span></div><div class="grid gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "rounded-[4px] border border-[var(--admin-border)] px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/50",
          to: unref(adminPaths).comments
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>评论管理</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>审核、通过或处理最新评论。</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "评论管理"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "审核、通过或处理最新评论。")
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
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>Banner 管理</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>维护首页与侧边栏的展示内容。</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "Banner 管理"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "维护首页与侧边栏的展示内容。")
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
              _push2(`<p class="text-sm font-semibold text-slate-900"${_scopeId}>站点设置</p><p class="mt-1 text-sm text-slate-500"${_scopeId}>修改 SEO、SMTP 与存储配置。</p>`);
            } else {
              return [
                createVNode("p", { class: "text-sm font-semibold text-slate-900" }, "站点设置"),
                createVNode("p", { class: "mt-1 text-sm text-slate-500" }, "修改 SEO、SMTP 与存储配置。")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">后台概览</h3><span class="text-sm text-slate-500">${ssrInterpolate(unref(dashboardState).profile?.displayName || unref(dashboardState).profile?.username || "管理员")}</span></div><div class="space-y-4"><div class="rounded-[4px] border border-[var(--admin-border)] px-4 py-4"><p class="text-xs text-slate-500">登录账号</p><p class="mt-1 text-sm font-medium text-slate-900">${ssrInterpolate(unref(dashboardState).profile?.email || "未获取到邮箱")}</p></div><div class="rounded-[4px] border border-[var(--admin-border)] px-4 py-4"><p class="text-xs text-slate-500">最后登录</p><p class="mt-1 text-sm font-medium text-slate-900">${ssrInterpolate(unref(dashboardState).profile?.lastLoginAt ? unref(formatAdminDate)(unref(dashboardState).profile.lastLoginAt) : "暂无记录")}</p></div></div></div></div><div class="space-y-6"><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">最新文章</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "text-sm font-medium text-blue-600",
          to: unref(adminPaths).articles
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`查看全部`);
            } else {
              return [
                createTextVNode("查看全部")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(recentArticles).length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(recentArticles), (article) => {
            _push(`<div class="flex items-center gap-4 rounded-[4px] border border-[var(--admin-border)] px-4 py-3"><div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-slate-900">${ssrInterpolate(article.title)}</p><p class="mt-1 text-xs text-slate-500">${ssrInterpolate(article.categories?.[0]?.name || "未分类")} · ${ssrInterpolate(unref(formatAdminDate)(article.createdAt))}</p></div>`);
            _push(ssrRenderComponent(_component_AdminStatusBadge, {
              tone: article.status === "published" ? "success" : "warning"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(article.status === "published" ? "已发布" : "草稿")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(article.status === "published" ? "已发布" : "草稿"), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5"><p class="text-sm font-semibold text-slate-900">暂无文章</p><p class="mt-1 text-sm text-slate-500">先创建第一篇文章后，这里会显示最近更新。</p></div>`);
        }
        _push(`</div><div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><h3 class="text-lg font-semibold text-slate-900">最新评论</h3>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "text-sm font-medium text-blue-600",
          to: unref(adminPaths).comments
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`查看全部`);
            } else {
              return [
                createTextVNode("查看全部")
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
          _push(`<div class="rounded-[4px] border border-dashed border-[var(--admin-border)] bg-slate-50 px-4 py-5"><p class="text-sm font-semibold text-slate-900">暂无评论</p><p class="mt-1 text-sm text-slate-500">有新评论后，这里会显示最近留言。</p></div>`);
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
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DJz0Pewt.js.map
