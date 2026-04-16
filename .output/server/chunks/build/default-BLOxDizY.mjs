import { _ as _sfc_main$3 } from './SiteSidebar-DbsjUJRM.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, withAsyncContext, provide, mergeProps, unref, ref, computed, withCtx, openBlock, createBlock, toDisplayString, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$4 } from './AppImage-CpDcJIeD.mjs';
import { f as fetchPublicSiteSettings } from './api-9xEAR-2s.mjs';
import { u as useAsyncData } from './asyncData-BA1__WkK.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import './SearchForm-BcN8g3MF.mjs';
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
import 'marked';
import './admin-editor-CUf6Pf5Q.mjs';
import './api-base-COxdl8qP.mjs';

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SiteHeader",
  __ssrInlineRender: true,
  props: {
    siteSettings: {}
  },
  setup(__props) {
    const props = __props;
    const mobileOpen = ref(false);
    const navigationItems = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = props.siteSettings) == null ? void 0 : _a.navigationItems) != null ? _b : []).filter((item) => item.enabled);
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "sticky top-0 z-50 border-b border-[var(--blog-border)] bg-[rgba(255,255,255,0.9)] backdrop-blur-xl lg:hidden" }, _attrs))}><div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "flex items-center gap-3",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
          if (_push2) {
            if ((_a = __props.siteSettings) == null ? void 0 : _a.logoUrl) {
              _push2(ssrRenderComponent(_sfc_main$4, {
                src: __props.siteSettings.logoUrl,
                alt: __props.siteSettings.siteTitle,
                class: "h-11 w-11 rounded-2xl object-cover",
                loading: "eager",
                fetchpriority: "high"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--blog-ink)] text-sm font-semibold text-white"${_scopeId}>${ssrInterpolate((((_b = __props.siteSettings) == null ? void 0 : _b.siteTitle) || "Blog").slice(0, 2).toUpperCase())}</div>`);
            }
            _push2(`<div${_scopeId}><p class="text-sm font-semibold tracking-[0.16em] text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(((_c = __props.siteSettings) == null ? void 0 : _c.siteTitle) || "Blog")}</p><p class="text-xs text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate((((_d = __props.siteSettings) == null ? void 0 : _d.siteDescription) || "").slice(0, 30))}${ssrInterpolate((((_e = __props.siteSettings) == null ? void 0 : _e.siteDescription) || "").length > 30 ? "..." : "")}</p></div>`);
          } else {
            return [
              ((_f = __props.siteSettings) == null ? void 0 : _f.logoUrl) ? (openBlock(), createBlock(_sfc_main$4, {
                key: 0,
                src: __props.siteSettings.logoUrl,
                alt: __props.siteSettings.siteTitle,
                class: "h-11 w-11 rounded-2xl object-cover",
                loading: "eager",
                fetchpriority: "high"
              }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--blog-ink)] text-sm font-semibold text-white"
              }, toDisplayString((((_g = __props.siteSettings) == null ? void 0 : _g.siteTitle) || "Blog").slice(0, 2).toUpperCase()), 1)),
              createVNode("div", null, [
                createVNode("p", { class: "text-sm font-semibold tracking-[0.16em] text-[var(--blog-ink)]" }, toDisplayString(((_h = __props.siteSettings) == null ? void 0 : _h.siteTitle) || "Blog"), 1),
                createVNode("p", { class: "text-xs text-[var(--blog-subtle)]" }, toDisplayString((((_i = __props.siteSettings) == null ? void 0 : _i.siteDescription) || "").slice(0, 30)) + toDisplayString((((_j = __props.siteSettings) == null ? void 0 : _j.siteDescription) || "").length > 30 ? "..." : ""), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="blog-toggle" type="button"${ssrRenderAttr("aria-label", unref(mobileOpen) ? "Close menu" : "Open menu")}>${ssrInterpolate(unref(mobileOpen) ? "x" : "=")}</button></div>`);
      if (unref(mobileOpen)) {
        _push(`<div class="border-t border-[var(--blog-border)] bg-white/95 px-6 py-4"><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(navigationItems), (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.id,
            to: item.href,
            class: "block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]",
            onClick: ($event) => mobileOpen.value = false
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SiteHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SiteFooter",
  __ssrInlineRender: true,
  props: {
    siteSettings: {}
  },
  setup(__props) {
    const props = __props;
    function toSafeString(value) {
      if (typeof value === "string") {
        return value;
      }
      if (value == null) {
        return "";
      }
      return String(value);
    }
    function isExternal(href) {
      return typeof href === "string" && (/^https?:\/\//i.test(href) || href.startsWith("//"));
    }
    function normalizeLinkItem(item, index) {
      if (!(item == null ? void 0 : item.enabled)) {
        return null;
      }
      const href = toSafeString(item.href).trim();
      if (!href) {
        return null;
      }
      const label = toSafeString(item.label).trim() || href;
      return {
        id: toSafeString(item.id) || `footer-link-${index}`,
        label,
        href,
        external: isExternal(href)
      };
    }
    const displayedNavigationItems = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.siteSettings) == null ? void 0 : _a.navigationItems) != null ? _b : []).map((item, index) => normalizeLinkItem(item, index)).filter((item) => item !== null).slice(0, 6);
    });
    const displayedLinks = computed(() => {
      var _a, _b;
      return ((_b = (_a = props.siteSettings) == null ? void 0 : _a.footerLinks) != null ? _b : []).map((item, index) => normalizeLinkItem(item, index)).filter((item) => item !== null).slice(0, 6);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "border-t border-[var(--blog-border)] bg-white/85 backdrop-blur" }, _attrs))}><div class="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[minmax(0,1.4fr)_0.8fr]"><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">${ssrInterpolate(((_a = __props.siteSettings) == null ? void 0 : _a.siteTitle) || "Blog")}</p><p class="mt-4 max-w-lg text-sm leading-7 text-[var(--blog-muted)]">${ssrInterpolate((_b = __props.siteSettings) == null ? void 0 : _b.siteDescription)}</p>`);
      if ((_c = __props.siteSettings) == null ? void 0 : _c.footerText) {
        _push(`<p class="mt-4 max-w-lg text-sm leading-7 text-[var(--blog-muted)]">${ssrInterpolate(__props.siteSettings.footerText)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Menu</p><div class="mt-4 space-y-3"><!--[-->`);
      ssrRenderList(unref(displayedNavigationItems), (item) => {
        _push(`<!--[-->`);
        if (item.external) {
          _push(`<a${ssrRenderAttr("href", item.href)} rel="noopener noreferrer" target="_blank" class="block text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]">${ssrInterpolate(item.label)}</a>`);
        } else {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.href,
            class: "block text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div></div><div><p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Links</p><div class="mt-4 flex flex-wrap gap-x-4 gap-y-3"><!--[-->`);
      ssrRenderList(unref(displayedLinks), (item) => {
        _push(`<!--[-->`);
        if (item.external) {
          _push(`<a${ssrRenderAttr("href", item.href)} rel="noopener noreferrer" target="_blank" class="text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]">${ssrInterpolate(item.label)}</a>`);
        } else {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.href,
            class: "text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div></div></div>`);
      if (((_d = __props.siteSettings) == null ? void 0 : _d.showFiling) && (__props.siteSettings.icpFiling || __props.siteSettings.policeFiling)) {
        _push(`<div class="border-t border-[var(--blog-border)] bg-white/50 px-6 py-4"><div class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 text-xs text-[var(--blog-subtle)]">`);
        if (__props.siteSettings.icpFiling) {
          _push(`<a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" class="transition hover:text-[var(--blog-ink)]">${ssrInterpolate(__props.siteSettings.icpFiling)}</a>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.siteSettings.icpFiling && __props.siteSettings.policeFiling) {
          _push(`<span class="text-[var(--blog-border)]">|</span>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.siteSettings.policeFiling) {
          _push(`<span>${ssrInterpolate(__props.siteSettings.policeFiling)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if ((_e = __props.siteSettings) == null ? void 0 : _e.customFooterCode) {
        _push(`<div>${(_f = __props.siteSettings.customFooterCode) != null ? _f : ""}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SiteFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings, {
      getCachedData(key, nuxtApp) {
        var _a;
        return (_a = nuxtApp.payload.data[key]) != null ? _a : nuxtApp.static.data[key];
      }
    })), __temp = await __temp, __restore(), __temp);
    provide("site-settings", siteSettings);
    useHead(() => {
      const settings = siteSettings.value;
      if (!settings) {
        return {
          title: "AKSRT Blog"
        };
      }
      return {
        titleTemplate: (titleChunk) => titleChunk ? `${titleChunk} | ${settings.siteTitle}` : settings.siteTitle,
        meta: [
          {
            name: "description",
            content: settings.seo.description || settings.siteDescription
          },
          {
            name: "keywords",
            content: settings.seo.keywords
          }
        ]
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_SiteSidebar = _sfc_main$3;
      const _component_SiteHeader = _sfc_main$2;
      const _component_SiteFooter = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "blog-shell min-h-screen bg-[var(--blog-bg)] text-[var(--blog-ink)]" }, _attrs))}><div class="mx-auto flex min-h-screen max-w-[1440px] gap-4 px-4 py-4 lg:gap-6 lg:px-6">`);
      _push(ssrRenderComponent(_component_SiteSidebar, {
        "site-settings": unref(siteSettings) || void 0
      }, null, _parent));
      _push(`<div class="min-w-0 flex-1">`);
      _push(ssrRenderComponent(_component_SiteHeader, {
        "site-settings": unref(siteSettings) || void 0
      }, null, _parent));
      _push(`<main class="pt-4 lg:pt-0">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
      _push(ssrRenderComponent(_component_SiteFooter, {
        "site-settings": unref(siteSettings) || void 0
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-BLOxDizY.mjs.map
