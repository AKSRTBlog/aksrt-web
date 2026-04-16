import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { defineComponent, mergeProps, useSSRContext, ref, computed, unref, withCtx, createVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrRenderSlot } from "vue/server-renderer";
import { g as getAdminRouteTitle, c as buildAdminCravatarUrl, d as fallbackAdminAvatar, e as adminNavSections, i as isAdminNavItemActive } from "./admin-BhXx1q9A.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import { u as useRoute } from "../server.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminNavIcon",
  __ssrInlineRender: true,
  props: {
    name: {}
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _push, _parent, _attrs) => {
      if (props.name === "dashboard") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v7H4zM14 4h6v5h-6zM14 11h6v9h-6zM4 15h6v5H4z"></path></svg>`);
      } else if (props.name === "articles") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h8M8 10h8M8 14h5M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z"></path></svg>`);
      } else if (props.name === "comments") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`);
      } else if (props.name === "pages") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3h8l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3v5h4M10 12h6M10 16h6"></path></svg>`);
      } else if (props.name === "friend-links") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.22"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 11a5 5 0 0 0-7.07 0L4.81 13.1a5 5 0 1 0 7.07 7.07l1.41-1.41"></path></svg>`);
      } else if (props.name === "content") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12M8 12h12M8 17h12"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h.01M3 12h.01M3 17h.01"></path></svg>`);
      } else if (props.name === "banners") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2"></rect><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 15 3-3 2 2 4-4 3 3"></path><circle cx="9" cy="9" r="1.5" stroke-width="2"></circle></svg>`);
      } else if (props.name === "media") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16v12H4z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M6 16l4-4 3 3 2-2 3 3"></path></svg>`);
      } else if (props.name === "projects") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>`);
      } else if (props.name === "settings") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25M12 18.75V21M4.72 4.72l1.59 1.59M17.69 17.69l1.59 1.59M3 12h2.25M18.75 12H21M4.72 19.28l1.59-1.59M17.69 6.31l1.59-1.59"></path><circle cx="12" cy="12" r="3.25" stroke-width="2"></circle></svg>`);
      } else if (props.name === "admins") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4" stroke-width="2"></circle></svg>`);
      } else if (props.name === "home") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10.5 12 3l9 7.5"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9.5V21h14V9.5"></path></svg>`);
      } else if (props.name === "logout") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 17l5-5-5-5"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H4"></path></svg>`);
      } else if (props.name === "menu") {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16"></path></svg>`);
      } else {
        _push(`<svg${ssrRenderAttrs(mergeProps({
          fill: "none",
          stroke: "currentColor",
          viewBox: "0 0 24 24",
          "aria-hidden": "true"
        }, _attrs))}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6 6 18"></path></svg>`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminNavIcon.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const mobileOpen = ref(false);
    const { profile } = useAdminSession();
    const currentTitle = computed(() => getAdminRouteTitle(route.path));
    const profileName = computed(() => profile.value?.displayName || profile.value?.username || "Admin");
    const profileEmail = computed(() => profile.value?.email?.trim() || "");
    const profileAvatar = computed(() => {
      if (profileEmail.value) {
        return buildAdminCravatarUrl(profileEmail.value);
      }
      return profile.value?.avatarUrl || fallbackAdminAvatar;
    });
    function closeMobile() {
      mobileOpen.value = false;
    }
    useHead({
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow"
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-[var(--admin-bg)] text-slate-900" }, _attrs))}><div class="flex min-h-screen items-start"><aside class="admin-sidebar-crisp relative z-30 hidden min-h-screen w-[244px] shrink-0 self-stretch bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 lg:block"><div class="sticky top-0 flex h-screen flex-col overflow-hidden"><div class="border-b border-white/15 px-3 py-3"><div class="flex items-center gap-2.5"><div class="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white"> AK </div><div class="min-w-0"><p class="truncate text-[13px] font-semibold text-white">AKSRT Blog</p><p class="truncate text-xs text-white/80">后台管理中心</p></div></div></div><div class="px-2.5 py-3"><div class="space-y-4"><!--[-->`);
      ssrRenderList(unref(adminNavSections), (section) => {
        _push(`<div><p class="px-2.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">${ssrInterpolate(section.title)}</p><nav class="space-y-0.5"><!--[-->`);
        ssrRenderList(section.items, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.to,
            to: item.to,
            class: [
              "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium leading-5 transition",
              unref(isAdminNavItemActive)(unref(route).path, item) ? "bg-white/20 !text-white" : "!text-white/85 hover:bg-white/10 hover:!text-white"
            ]
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"${_scopeId}>`);
                _push2(ssrRenderComponent(_sfc_main$1, {
                  name: item.icon,
                  class: "h-4 w-4"
                }, null, _parent2, _scopeId));
                _push2(`</span><span${_scopeId}>${ssrInterpolate(item.label)}</span>`);
              } else {
                return [
                  createVNode("span", { class: "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10" }, [
                    createVNode(_sfc_main$1, {
                      name: item.icon,
                      class: "h-4 w-4"
                    }, null, 8, ["name"])
                  ]),
                  createVNode("span", null, toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></nav></div>`);
      });
      _push(`<!--]--></div></div><div class="mt-auto border-t border-white/15 px-2.5 py-3"><div class="space-y-0.5">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 !text-white/85 transition hover:bg-white/10 hover:!text-white",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$1, {
              name: "home",
              class: "h-4 w-4"
            }, null, _parent2, _scopeId));
            _push2(`</span><span${_scopeId}>返回前台</span>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10" }, [
                createVNode(_sfc_main$1, {
                  name: "home",
                  class: "h-4 w-4"
                })
              ]),
              createVNode("span", null, "返回前台")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-5 !text-white/85 transition hover:bg-white/10 hover:!text-white" type="button"><span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">`);
      _push(ssrRenderComponent(_sfc_main$1, {
        name: "logout",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`</span><span>退出登录</span></button></div></div></div></aside>`);
      if (unref(mobileOpen)) {
        _push(`<div class="fixed inset-0 z-50 lg:hidden"><div class="absolute inset-0 bg-slate-950/70"></div><aside class="admin-sidebar-crisp absolute inset-y-0 left-0 z-50 flex w-80 flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 shadow-2xl"><div class="flex items-center justify-between border-b border-white/10 px-4 py-4"><p class="text-sm font-semibold text-white">菜单</p><button class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-white" type="button">`);
        _push(ssrRenderComponent(_sfc_main$1, {
          name: "close",
          class: "h-4 w-4"
        }, null, _parent));
        _push(`</button></div><div class="flex-1 px-3 py-4"><div class="space-y-5"><!--[-->`);
        ssrRenderList(unref(adminNavSections), (section) => {
          _push(`<div><p class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/65">${ssrInterpolate(section.title)}</p><nav class="space-y-1"><!--[-->`);
          ssrRenderList(section.items, (item) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: item.to,
              to: item.to,
              class: [
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                unref(isAdminNavItemActive)(unref(route).path, item) ? "bg-white/20 !text-white" : "!text-white/85 hover:bg-white/10 hover:!text-white"
              ],
              onClick: closeMobile
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10"${_scopeId}>`);
                  _push2(ssrRenderComponent(_sfc_main$1, {
                    name: item.icon,
                    class: "h-4 w-4"
                  }, null, _parent2, _scopeId));
                  _push2(`</span><span${_scopeId}>${ssrInterpolate(item.label)}</span>`);
                } else {
                  return [
                    createVNode("span", { class: "inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10" }, [
                      createVNode(_sfc_main$1, {
                        name: item.icon,
                        class: "h-4 w-4"
                      }, null, 8, ["name"])
                    ]),
                    createVNode("span", null, toDisplayString(item.label), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></nav></div>`);
        });
        _push(`<!--]--></div></div></aside></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative z-0 flex min-w-0 flex-1 flex-col"><header class="sticky top-0 z-20 border-b border-[var(--admin-border)] bg-white/90 backdrop-blur"><div class="flex h-16 items-center justify-between px-4 sm:px-6"><div class="flex items-center gap-3"><button class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--admin-border)] text-slate-500 lg:hidden" type="button">`);
      _push(ssrRenderComponent(_sfc_main$1, {
        name: "menu",
        class: "h-4 w-4"
      }, null, _parent));
      _push(`</button><div><p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Admin</p><h1 class="text-base font-semibold text-slate-900">${ssrInterpolate(unref(currentTitle))}</h1></div></div><div class="hidden items-center gap-3 rounded-2xl border border-[var(--admin-border)] bg-white px-3 py-2 sm:flex"><img class="h-9 w-9 rounded-full object-cover"${ssrRenderAttr("src", unref(profileAvatar))}${ssrRenderAttr("alt", unref(profileName))}><div><p class="text-sm font-medium text-slate-900">${ssrInterpolate(unref(profileName))}</p><p class="text-xs text-slate-500">${ssrInterpolate(unref(profileEmail) || "未设置邮箱")}</p></div></div></div></header><main class="flex-1 px-4 py-6 sm:px-6">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=admin-BKuapg0Z.js.map
