import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { _ as _sfc_main$1 } from './MarkdownContent-BbiPhAn4.mjs';
import { _ as _sfc_main$2 } from './EmptyState-6npZcwUe.mjs';
import { defineComponent, computed, withAsyncContext, unref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { f as fetchPublicSiteSettings, n as fetchPublicStandalonePage } from './api-9xEAR-2s.mjs';
import { u as useRoute } from './server.mjs';
import { u as useAsyncData } from './asyncData-BA1__WkK.mjs';
import { e as estimateReadingTime } from './admin-editor-CUf6Pf5Q.mjs';
import { u as useSeoMeta, a as useHead } from './v3-CVe3IQuN.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'marked';
import './api-base-COxdl8qP.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const slug = computed(() => String(route.params.slug || ""));
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings)), __temp = await __temp, __restore(), __temp);
    const { data: page } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      () => `standalone-${slug.value}`,
      () => fetchPublicStandalonePage(slug.value),
      "$E292ei_RbT"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const readingTime = computed(() => {
      var _a;
      return estimateReadingTime(((_a = page.value) == null ? void 0 : _a.content) || "");
    });
    const canonicalUrl = computed(() => {
      var _a, _b, _c;
      const base = ((_c = (_b = (_a = siteSettings.value) == null ? void 0 : _a.seo) == null ? void 0 : _b.canonicalUrl) == null ? void 0 : _c.replace(/\/+$/, "")) || "";
      return page.value && base ? `${base}/pages/${page.value.slug}` : "";
    });
    useSeoMeta({
      title: () => {
        var _a;
        return ((_a = page.value) == null ? void 0 : _a.title) || "Page";
      },
      description: () => {
        var _a, _b;
        return ((_a = page.value) == null ? void 0 : _a.summary) || ((_b = siteSettings.value) == null ? void 0 : _b.siteDescription) || "";
      }
    });
    useHead(() => ({
      link: canonicalUrl.value ? [
        {
          rel: "canonical",
          href: canonicalUrl.value
        }
      ] : []
    }));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_MarkdownContent = _sfc_main$1;
      const _component_EmptyState = _sfc_main$2;
      if (unref(page)) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "pb-20" }, _attrs))}><section class="mx-auto max-w-7xl px-0 pt-4 sm:px-6"><div class="blog-panel overflow-hidden rounded-none sm:rounded-[4px]"><div class="p-6 md:p-8 lg:p-10"><div class="flex flex-wrap items-center gap-2 text-sm text-[var(--blog-muted)]">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "text-[var(--blog-accent)] transition hover:underline",
          to: "/"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Home`);
            } else {
              return [
                createTextVNode("Home")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span>/</span><span class="text-[var(--blog-ink)]">${ssrInterpolate(unref(page).title)}</span></div><div class="mt-8 max-w-4xl"><h1 class="text-4xl font-semibold leading-tight tracking-[-0.05em] text-[var(--blog-ink)] md:text-6xl">${ssrInterpolate(unref(page).title)}</h1>`);
        if (unref(page).summary) {
          _push(`<p class="mt-6 max-w-3xl text-base leading-8 text-[var(--blog-muted)] md:text-lg">${ssrInterpolate(unref(page).summary)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<ul class="mt-8 flex flex-wrap gap-4 text-sm text-[var(--blog-muted)]"><li>Path: /pages/${ssrInterpolate(unref(page).slug)}</li><li>Reading time: ${ssrInterpolate(unref(readingTime))} min</li></ul></div></div><div class="border-t border-[var(--blog-border)]">`);
        _push(ssrRenderComponent(_component_MarkdownContent, {
          content: unref(page).content
        }, null, _parent));
        _push(`</div></div></section><section class="mx-auto max-w-7xl px-0 pt-8 sm:px-6"><div class="blog-panel rounded-none px-6 py-6 sm:rounded-[4px] md:px-10 md:py-8">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "inline-flex items-center gap-2 text-base font-medium text-[var(--blog-accent)] transition hover:underline",
          to: "/"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Back home `);
            } else {
              return [
                createTextVNode(" Back home ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></section></div>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-4xl px-6 py-16" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Page not found",
          description: "The requested standalone page is unavailable.",
          "action-label": "Back home",
          "action-href": "/"
        }, null, _parent));
        _push(`</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pages/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-JsV9IRiU.mjs.map
