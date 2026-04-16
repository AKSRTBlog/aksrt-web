import { _ as _sfc_main$1 } from "./PageHero-mei_8pXg.js";
import { _ as _sfc_main$2 } from "./EmptyState-6npZcwUe.js";
import { _ as _sfc_main$3 } from "./ArticleFeed-DwZp94Wf.js";
import { _ as _sfc_main$4 } from "./SiteSidebar-DbsjUJRM.js";
import { defineComponent, computed, withAsyncContext, watchEffect, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import { m as deriveTags, i as filterArticles, f as fetchPublicSiteSettings, j as fetchAllPublicArticles } from "./api-9xEAR-2s.js";
import { u as useRoute, c as createError } from "../server.mjs";
import { u as useAsyncData } from "./asyncData-BA1__WkK.js";
import { a as useSeoMeta } from "./v3-CVe3IQuN.js";
import "./nuxt-link-QV1LfQc6.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./ArticleCard-BxTDfe5W.js";
import "./AppImage-CpDcJIeD.js";
import "./SearchForm-BcN8g3MF.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const slug = computed(() => String(route.params.slug || ""));
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings)), __temp = await __temp, __restore(), __temp);
    const { data: articles, pending } = useAsyncData("shared-all-articles", fetchAllPublicArticles, { lazy: true });
    const tags = computed(() => deriveTags(articles.value || []));
    const tag = computed(() => tags.value.find((item) => item.slug === slug.value) || null);
    const result = computed(() => filterArticles(articles.value || [], { tag: slug.value }));
    if (articles.value && !tag.value) {
      throw createError({ statusCode: 404, statusMessage: "Tag not found" });
    }
    watchEffect(() => {
    });
    useSeoMeta({
      title: () => tag.value ? `Tag: ${tag.value.name}` : "Tag",
      description: () => tag.value ? `Articles tagged with ${tag.value.name}.` : "Tag archive."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$1;
      const _component_EmptyState = _sfc_main$2;
      const _component_ArticleFeed = _sfc_main$3;
      const _component_SiteSidebar = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(tag)) {
        _push(ssrRenderComponent(_component_PageHero, {
          eyebrow: "Tag",
          title: `#${unref(tag).name}`,
          description: "Articles connected to this topic.",
          "stat-label": "Articles",
          "stat-value": unref(result).length
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="mx-auto grid max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_300px]"><div>`);
      if (unref(tag) && unref(result).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "No articles use this tag yet",
          description: "The tag exists, but it is not attached to any published article right now.",
          "action-label": "Back to articles",
          "action-href": "/articles"
        }, null, _parent));
      } else if (unref(tag)) {
        _push(ssrRenderComponent(_component_ArticleFeed, {
          articles: unref(result),
          view: "grid"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      _push(ssrRenderComponent(_component_SiteSidebar, {
        "site-settings": unref(siteSettings) || void 0
      }, null, _parent));
      _push(`</section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/tags/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_slug_-CXOi8hxq.js.map
