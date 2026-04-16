import { _ as _sfc_main$1 } from './PageHero-mei_8pXg.mjs';
import { _ as _sfc_main$2 } from './SearchForm-BcN8g3MF.mjs';
import { _ as _sfc_main$3 } from './EmptyState-6npZcwUe.mjs';
import { _ as _sfc_main$4 } from './ArticleFeed-DwZp94Wf.mjs';
import { defineComponent, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { i as fetchAllPublicArticles, j as filterArticles } from './api-9xEAR-2s.mjs';
import { u as useRoute } from './server.mjs';
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
  __name: "search",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const keyword = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const { data: articles, pending } = useAsyncData("shared-all-articles", fetchAllPublicArticles, { lazy: true });
    const results = computed(() => filterArticles(articles.value || [], { keyword: keyword.value }));
    useSeoMeta({
      title: () => keyword.value ? `Search: ${keyword.value}` : "Search",
      description: () => keyword.value ? `Search results for ${keyword.value}.` : "Search the article archive.",
      robots: "noindex,follow"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$1;
      const _component_SearchForm = _sfc_main$2;
      const _component_EmptyState = _sfc_main$3;
      const _component_ArticleFeed = _sfc_main$4;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_PageHero, {
        centered: "",
        eyebrow: "Search",
        title: "Search the archive",
        description: "Find articles by title, category, tag, or keyword."
      }, null, _parent));
      _push(`<section class="mx-auto max-w-6xl px-6 pb-20">`);
      _push(ssrRenderComponent(_component_SearchForm, {
        "initial-value": unref(keyword),
        "class-name": "mx-auto max-w-3xl"
      }, null, _parent));
      _push(`<div class="mt-8">`);
      if (unref(pending) && unref(keyword)) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Searching\u2026",
          description: "Looking for matching articles."
        }, null, _parent));
      } else if (!unref(keyword)) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Start with a keyword",
          description: "Search the full article archive by entering a word, topic, or tag."
        }, null, _parent));
      } else if (unref(results).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "No search results",
          description: "Try a shorter keyword or browse the archive for nearby topics.",
          "action-label": "Browse archive",
          "action-href": "/archive"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_ArticleFeed, {
          articles: unref(results),
          view: "list"
        }, null, _parent));
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=search-COxHrHRD.mjs.map
