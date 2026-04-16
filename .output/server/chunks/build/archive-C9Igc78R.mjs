import { _ as _sfc_main$1 } from './PageHero-mei_8pXg.mjs';
import { _ as _sfc_main$2 } from './EmptyState-6npZcwUe.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, computed, unref, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { i as fetchAllPublicArticles, k as buildArchiveGroups, l as formatLongDate } from './api-9xEAR-2s.mjs';
import { u as useAsyncData } from './asyncData-BA1__WkK.mjs';
import { u as useSeoMeta } from './v3-CVe3IQuN.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "archive",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: articles, pending } = useAsyncData("shared-all-articles", fetchAllPublicArticles, { lazy: true });
    const archiveGroups = computed(() => buildArchiveGroups(articles.value || []));
    useSeoMeta({
      title: "Archive",
      description: "Browse published posts by year and month."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$1;
      const _component_EmptyState = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_PageHero, {
        centered: "",
        eyebrow: "Archive",
        title: "Timeline of posts",
        description: "Browse the full publishing history by year and month."
      }, null, _parent));
      _push(`<section class="mx-auto max-w-6xl px-6 pb-20"><div class="space-y-6">`);
      if (unref(pending)) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Loading archive\u2026",
          description: "Articles are being loaded."
        }, null, _parent));
      } else if (unref(archiveGroups).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "The archive is empty",
          description: "No published articles are available yet.",
          "action-label": "View articles",
          "action-href": "/articles"
        }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(archiveGroups), (yearGroup) => {
        _push(`<div class="blog-panel p-8"><div class="flex items-end justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Year</p><h2 class="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">${ssrInterpolate(yearGroup.year)}</h2></div><p class="text-sm text-[var(--blog-subtle)]">${ssrInterpolate(yearGroup.total)} posts</p></div><div class="mt-8 space-y-6"><!--[-->`);
        ssrRenderList(yearGroup.months, (monthGroup) => {
          _push(`<div><div class="flex items-center justify-between gap-3"><h3 class="text-lg font-semibold text-[var(--blog-ink)]">${ssrInterpolate(monthGroup.month)}</h3><span class="text-xs text-[var(--blog-subtle)]">${ssrInterpolate(monthGroup.items.length)} posts</span></div><div class="mt-4 space-y-3"><!--[-->`);
          ssrRenderList(monthGroup.items, (article) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: article.id,
              to: `/articles/${article.slug}`,
              class: "flex flex-col gap-2 rounded-[4px] border border-[var(--blog-border)] px-4 py-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)] md:flex-row md:items-center md:justify-between"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                var _a, _b, _c, _d;
                if (_push2) {
                  _push2(`<div${_scopeId}><p class="text-sm font-semibold text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(article.title)}</p><p class="mt-1 text-xs text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate(((_b = (_a = article.categories) == null ? void 0 : _a[0]) == null ? void 0 : _b.name) || "Uncategorized")}</p></div><span class="text-xs text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate(unref(formatLongDate)(article.publishedAt))}</span>`);
                } else {
                  return [
                    createVNode("div", null, [
                      createVNode("p", { class: "text-sm font-semibold text-[var(--blog-ink)]" }, toDisplayString(article.title), 1),
                      createVNode("p", { class: "mt-1 text-xs text-[var(--blog-subtle)]" }, toDisplayString(((_d = (_c = article.categories) == null ? void 0 : _c[0]) == null ? void 0 : _d.name) || "Uncategorized"), 1)
                    ]),
                    createVNode("span", { class: "text-xs text-[var(--blog-subtle)]" }, toDisplayString(unref(formatLongDate)(article.publishedAt)), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div></div>`);
      });
      _push(`<!--]--></div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/archive.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=archive-C9Igc78R.mjs.map
