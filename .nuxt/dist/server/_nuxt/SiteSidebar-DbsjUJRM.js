import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { _ as _sfc_main$2 } from "./SearchForm-BcN8g3MF.js";
import { defineComponent, computed, mergeProps, withCtx, openBlock, createBlock, toDisplayString, createVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from "vue/server-renderer";
import { _ as _sfc_main$1 } from "./AppImage-CpDcJIeD.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SiteSidebar",
  __ssrInlineRender: true,
  props: {
    siteSettings: {}
  },
  setup(__props) {
    const props = __props;
    const navigationItems = computed(
      () => (props.siteSettings?.navigationItems ?? []).filter((item) => item.enabled)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_SearchForm = _sfc_main$2;
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "blog-rail hidden w-[300px] shrink-0 flex-col self-start lg:sticky lg:top-4 lg:flex" }, _attrs))}><div class="border-b border-[var(--blog-border)] px-6 py-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "flex items-center gap-3",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.siteSettings?.logoUrl) {
              _push2(ssrRenderComponent(_sfc_main$1, {
                src: __props.siteSettings.logoUrl,
                alt: __props.siteSettings.siteTitle,
                class: "h-12 w-12 rounded-[1.25rem] object-cover",
                loading: "eager"
              }, null, _parent2, _scopeId));
            } else {
              _push2(`<div class="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--blog-ink)] text-sm font-semibold text-white"${_scopeId}>${ssrInterpolate((__props.siteSettings?.siteTitle || "Blog").slice(0, 2).toUpperCase())}</div>`);
            }
            _push2(`<div class="min-w-0"${_scopeId}><p class="truncate text-sm font-semibold tracking-[0.18em] text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(__props.siteSettings?.siteTitle || "Blog")}</p><p class="mt-1 text-xs text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate((__props.siteSettings?.siteDescription || "").slice(0, 30))}${ssrInterpolate((__props.siteSettings?.siteDescription || "").length > 30 ? "..." : "")}</p></div>`);
          } else {
            return [
              __props.siteSettings?.logoUrl ? (openBlock(), createBlock(_sfc_main$1, {
                key: 0,
                src: __props.siteSettings.logoUrl,
                alt: __props.siteSettings.siteTitle,
                class: "h-12 w-12 rounded-[1.25rem] object-cover",
                loading: "eager"
              }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                key: 1,
                class: "flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--blog-ink)] text-sm font-semibold text-white"
              }, toDisplayString((__props.siteSettings?.siteTitle || "Blog").slice(0, 2).toUpperCase()), 1)),
              createVNode("div", { class: "min-w-0" }, [
                createVNode("p", { class: "truncate text-sm font-semibold tracking-[0.18em] text-[var(--blog-ink)]" }, toDisplayString(__props.siteSettings?.siteTitle || "Blog"), 1),
                createVNode("p", { class: "mt-1 text-xs text-[var(--blog-subtle)]" }, toDisplayString((__props.siteSettings?.siteDescription || "").slice(0, 30)) + toDisplayString((__props.siteSettings?.siteDescription || "").length > 30 ? "..." : ""), 1)
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="px-5 py-5"><div class="space-y-6"><div><p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Search</p><div class="mt-3">`);
      _push(ssrRenderComponent(_component_SearchForm, { "class-name": "rounded-[4px] bg-[var(--blog-soft)] px-3 py-2 shadow-none" }, null, _parent));
      _push(`</div></div><div><p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Menu</p><div class="mt-3 space-y-1"><!--[-->`);
      ssrRenderList(unref(navigationItems), (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.id,
          to: item.href,
          class: "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span${_scopeId}>${ssrInterpolate(item.label)}</span><span class="text-[10px] uppercase tracking-[0.22em] opacity-60"${_scopeId}>Open</span>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(item.label), 1),
                createVNode("span", { class: "text-[10px] uppercase tracking-[0.22em] opacity-60" }, "Open")
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></div></div></aside>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SiteSidebar.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=SiteSidebar-DbsjUJRM.js.map
