import { defineComponent, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { _ as _sfc_main$3 } from './AppImage-CpDcJIeD.mjs';
import { f as fetchPublicSiteSettings, d as fetchPublicArticles, e as fetchPublicBanners, g as formatDate } from './api-9xEAR-2s.mjs';
import { _ as _sfc_main$2 } from './ArticleFeed-DwZp94Wf.mjs';
import { u as useAsyncData } from './asyncData-BA1__WkK.mjs';
import { u as useSeoMeta, a as useHead } from './v3-CVe3IQuN.mjs';
import 'marked';
import './admin-editor-CUf6Pf5Q.mjs';
import './api-base-COxdl8qP.mjs';
import './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './ArticleCard-BxTDfe5W.mjs';
import './nuxt-link-QV1LfQc6.mjs';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "BannerShowcase",
  __ssrInlineRender: true,
  props: {
    banners: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.banners.length === 1) {
        _push(`<div${ssrRenderAttrs(_attrs)}><a${ssrRenderAttr("href", __props.banners[0].linkUrl)}${ssrRenderAttr("target", __props.banners[0].linkTarget)}${ssrRenderAttr("rel", __props.banners[0].linkTarget === "_blank" ? "noopener noreferrer" : void 0)} class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]">`);
        _push(ssrRenderComponent(_sfc_main$3, {
          src: __props.banners[0].imageUrl,
          alt: __props.banners[0].title,
          class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
          loading: "eager",
          fetchpriority: "high"
        }, null, _parent));
        if (__props.banners[0].showText) {
          _push(`<div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>`);
        } else {
          _push(`<!---->`);
        }
        if (__props.banners[0].showText) {
          _push(`<div class="absolute inset-x-0 bottom-0 p-3 md:p-5"><h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">${ssrInterpolate(__props.banners[0].title)}</h2>`);
          if (__props.banners[0].description) {
            _push(`<p class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">${ssrInterpolate(__props.banners[0].description)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</a></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-3 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)] lg:items-stretch" }, _attrs))}>`);
        if (__props.banners[0]) {
          _push(`<a${ssrRenderAttr("href", __props.banners[0].linkUrl)}${ssrRenderAttr("target", __props.banners[0].linkTarget)}${ssrRenderAttr("rel", __props.banners[0].linkTarget === "_blank" ? "noopener noreferrer" : void 0)} class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]">`);
          _push(ssrRenderComponent(_sfc_main$3, {
            src: __props.banners[0].imageUrl,
            alt: __props.banners[0].title,
            class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
            loading: "eager",
            fetchpriority: "high"
          }, null, _parent));
          if (__props.banners[0].showText) {
            _push(`<div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.banners[0].showText) {
            _push(`<div class="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm"> Banner </div>`);
          } else {
            _push(`<!---->`);
          }
          if (__props.banners[0].showText) {
            _push(`<div class="absolute inset-x-0 bottom-0 p-3 md:p-5"><h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">${ssrInterpolate(__props.banners[0].title)}</h2>`);
            if (__props.banners[0].description) {
              _push(`<p class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">${ssrInterpolate(__props.banners[0].description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="mt-3 text-xs text-white/80">${ssrInterpolate(unref(formatDate)(__props.banners[0].updatedAt))}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</a>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid gap-3"><!--[-->`);
        ssrRenderList(__props.banners.slice(1, 3), (banner) => {
          _push(`<a${ssrRenderAttr("href", banner.linkUrl)}${ssrRenderAttr("target", banner.linkTarget)}${ssrRenderAttr("rel", banner.linkTarget === "_blank" ? "noopener noreferrer" : void 0)} class="group relative block h-[160px] overflow-hidden rounded-[4px] bg-slate-950 md:h-[180px] lg:h-[194px]">`);
          _push(ssrRenderComponent(_sfc_main$3, {
            src: banner.imageUrl,
            alt: banner.title,
            class: "h-full w-full object-cover transition duration-500 group-hover:scale-105"
          }, null, _parent));
          if (banner.showText) {
            _push(`<div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>`);
          } else {
            _push(`<!---->`);
          }
          if (banner.showText) {
            _push(`<div class="absolute inset-x-0 bottom-0 p-3 md:p-4"><h2 class="text-sm font-semibold leading-snug text-white md:text-lg">${ssrInterpolate(banner.title)}</h2>`);
            if (banner.description) {
              _push(`<p class="mt-2 line-clamp-1 text-[11px] text-white/80 md:text-sm">${ssrInterpolate(banner.description)}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</a>`);
        });
        _push(`<!--]--></div></div>`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/BannerShowcase.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: siteSettingsData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings)), __temp = await __temp, __restore(), __temp);
    const siteSettings = computed(() => siteSettingsData.value || null);
    const [{ data: articleData }, { data: banners }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useAsyncData("home-articles", () => fetchPublicArticles({ page: 1, pageSize: 6 })),
      useAsyncData("home-banners", () => fetchPublicBanners("home_top"))
    ])), __temp = await __temp, __restore(), __temp);
    useSeoMeta({
      title: () => {
        var _a, _b;
        return ((_b = (_a = siteSettings.value) == null ? void 0 : _a.seo) == null ? void 0 : _b.title) || "Home";
      },
      description: () => {
        var _a, _b, _c;
        return ((_b = (_a = siteSettings.value) == null ? void 0 : _a.seo) == null ? void 0 : _b.description) || ((_c = siteSettings.value) == null ? void 0 : _c.siteDescription) || "";
      }
    });
    useHead(() => {
      var _a, _b;
      return {
        link: ((_b = (_a = siteSettings.value) == null ? void 0 : _a.seo) == null ? void 0 : _b.canonicalUrl) ? [
          {
            rel: "canonical",
            href: siteSettings.value.seo.canonicalUrl
          }
        ] : []
      };
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_BannerShowcase = _sfc_main$1;
      const _component_ArticleFeed = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-8" }, _attrs))}>`);
      if (unref(banners) && unref(banners).length > 0) {
        _push(`<section class="mx-auto max-w-6xl px-2 pt-4 sm:px-6 lg:pt-0">`);
        _push(ssrRenderComponent(_component_BannerShowcase, {
          banners: unref(banners).slice(0, 3)
        }, null, _parent));
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="mx-auto max-w-6xl px-0 pb-16 sm:px-6"><div class="mt-8">`);
      _push(ssrRenderComponent(_component_ArticleFeed, {
        articles: ((_a = unref(articleData)) == null ? void 0 : _a.list) || [],
        view: "list"
      }, null, _parent));
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DxkR5ILN.mjs.map
