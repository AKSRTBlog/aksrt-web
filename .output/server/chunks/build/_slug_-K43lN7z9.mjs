import { _ as _sfc_main$1 } from './PageHero-mei_8pXg.mjs';
import { _ as _sfc_main$2 } from './EmptyState-6npZcwUe.mjs';
import { _ as _sfc_main$3 } from './ArticleFeed-DwZp94Wf.mjs';
import { _ as _sfc_main$4 } from './SiteSidebar-DbsjUJRM.mjs';
import { defineComponent, computed, withAsyncContext, watchEffect, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { f as fetchPublicSiteSettings, o as fetchPublicCategories, i as fetchAllPublicArticles, j as filterArticles } from './api-9xEAR-2s.mjs';
import { u as useRoute, c as createError } from './server.mjs';
import { u as useAsyncData } from './asyncData-BA1__WkK.mjs';
import { u as useSeoMeta } from './v3-CVe3IQuN.mjs';
import './nuxt-link-QV1LfQc6.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './ArticleCard-BxTDfe5W.mjs';
import './AppImage-CpDcJIeD.mjs';
import './SearchForm-BcN8g3MF.mjs';
import 'marked';
import './admin-editor-CUf6Pf5Q.mjs';
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
    const { data: categories } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("category-categories", fetchPublicCategories)), __temp = await __temp, __restore(), __temp);
    const { data: articles } = useAsyncData("shared-all-articles", fetchAllPublicArticles, { lazy: true });
    const category = computed(() => (categories.value || []).find((item) => item.slug === slug.value) || null);
    const result = computed(() => filterArticles(articles.value || [], { category: slug.value }));
    if (categories.value && !category.value) {
      throw createError({ statusCode: 404, statusMessage: "Category not found" });
    }
    watchEffect(() => {
    });
    useSeoMeta({
      title: () => category.value ? `Category: ${category.value.name}` : "Category",
      description: () => category.value ? `Articles filed under ${category.value.name}.` : "Category archive."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$1;
      const _component_EmptyState = _sfc_main$2;
      const _component_ArticleFeed = _sfc_main$3;
      const _component_SiteSidebar = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      if (unref(category)) {
        _push(ssrRenderComponent(_component_PageHero, {
          eyebrow: "Category",
          title: unref(category).name,
          description: "Articles grouped under this category.",
          "stat-label": "Articles",
          "stat-value": unref(result).length
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<section class="mx-auto grid max-w-6xl gap-10 px-6 pb-20 lg:grid-cols-[minmax(0,1fr)_300px]"><div>`);
      if (unref(category) && unref(result).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "No articles in this category yet",
          description: "This category exists, but there are no published articles inside it right now.",
          "action-label": "Back to articles",
          "action-href": "/articles"
        }, null, _parent));
      } else if (unref(category)) {
        _push(ssrRenderComponent(_component_ArticleFeed, {
          articles: unref(result),
          view: "list"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/categories/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-K43lN7z9.mjs.map
