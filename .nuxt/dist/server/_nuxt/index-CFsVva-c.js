import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { _ as _sfc_main$1 } from "./EmptyState-6npZcwUe.js";
import { _ as _sfc_main$2 } from "./ArticleFeed-DwZp94Wf.js";
import { defineComponent, withAsyncContext, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import { i as filterArticles, o as mergeCategories, j as fetchAllPublicArticles, p as fetchPublicCategories } from "./api-9xEAR-2s.js";
import { u as useRoute } from "../server.mjs";
import { u as useAsyncData } from "./asyncData-BA1__WkK.js";
import { a as useSeoMeta } from "./v3-CVe3IQuN.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./ArticleCard-BxTDfe5W.js";
import "./AppImage-CpDcJIeD.js";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const [{ data: articles }, { data: publicCategories }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useAsyncData("shared-all-articles", fetchAllPublicArticles),
      useAsyncData("articles-categories", fetchPublicCategories)
    ])), __temp = await __temp, __restore(), __temp);
    const keyword = computed(() => typeof route.query.q === "string" ? route.query.q : "");
    const category = computed(() => typeof route.query.category === "string" ? route.query.category : "");
    const tag = computed(() => typeof route.query.tag === "string" ? route.query.tag : "");
    const sort = computed(() => {
      return route.query.sort === "reading" || route.query.sort === "popular" ? route.query.sort : "latest";
    });
    const view = computed(() => route.query.view === "grid" ? "grid" : "list");
    const filteredArticles = computed(() => filterArticles(articles.value || [], {
      keyword: keyword.value,
      category: category.value || void 0,
      tag: tag.value || void 0,
      sort: sort.value
    }));
    const categories = computed(() => mergeCategories(publicCategories.value || [], articles.value || []));
    const tags = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const article of articles.value || []) {
        for (const item of article.tags) {
          const current = map.get(item.slug);
          map.set(item.slug, {
            id: item.id,
            name: item.name,
            slug: item.slug,
            count: (current?.count || 0) + 1
          });
        }
      }
      return [...map.values()].sort((left, right) => right.count - left.count);
    });
    useSeoMeta({
      title: "Articles",
      description: "Browse articles by topic, tag, or keyword."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_EmptyState = _sfc_main$1;
      const _component_ArticleFeed = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "-mx-4 sm:mx-0" }, _attrs))}><section class="mx-auto max-w-6xl px-0 pb-20 sm:px-6"><div class="space-y-6"><div class="blog-panel p-5"><div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div class="flex flex-1 items-center gap-3 rounded-[4px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3"><span class="text-[var(--blog-muted)]">Q</span><input${ssrRenderAttr("value", unref(keyword))} class="w-full bg-transparent text-sm text-[var(--blog-ink)] outline-none placeholder:text-[var(--blog-subtle)]" placeholder="Search articles"></div><div class="flex flex-wrap items-center gap-3"><select class="blog-select"${ssrRenderAttr("value", unref(sort))}><option value="latest">Latest</option><option value="reading">Reading time</option><option value="popular">Popular</option></select><div class="flex items-center gap-1 rounded-full border border-[var(--blog-border)] bg-[var(--blog-soft)] p-1"><button class="${ssrRenderClass([unref(view) === "grid" ? "blog-toggle-active" : "blog-toggle", "blog-toggle"])}" type="button">G</button><button class="${ssrRenderClass([unref(view) === "list" ? "blog-toggle-active" : "blog-toggle", "blog-toggle"])}" type="button">L</button></div></div></div><div class="mt-5 space-y-4"><div><p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-subtle)]">Categories</p><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([!unref(category) ? "blog-filter-active" : "blog-filter", "blog-filter"])}" type="button">All</button><!--[-->`);
      ssrRenderList(unref(categories), (item) => {
        _push(`<button class="${ssrRenderClass([unref(category) === item.slug ? "blog-filter-active" : "blog-filter", "blog-filter"])}" type="button">${ssrInterpolate(item.name)}</button>`);
      });
      _push(`<!--]--></div></div><div><p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-subtle)]">Tags</p><div class="flex flex-wrap gap-2"><button class="${ssrRenderClass([!unref(tag) ? "blog-filter-active" : "blog-filter", "blog-filter"])}" type="button">All</button><!--[-->`);
      ssrRenderList(unref(tags).slice(0, 10), (item) => {
        _push(`<button class="${ssrRenderClass([unref(tag) === item.slug ? "blog-filter-active" : "blog-filter", "blog-filter"])}" type="button"> #${ssrInterpolate(item.name)}</button>`);
      });
      _push(`<!--]--></div></div></div></div><div class="flex flex-wrap items-center justify-between gap-3 px-0 sm:px-1"><p class="text-sm text-[var(--blog-muted)]">${ssrInterpolate(unref(filteredArticles).length)} articles</p>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "text-sm font-medium text-[var(--blog-accent)]",
        to: "/search"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Search`);
          } else {
            return [
              createTextVNode("Search")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      if (unref(filteredArticles).length === 0) {
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "No matching articles",
          description: "Try a different keyword, category, or tag, or browse the archive instead.",
          "action-label": "Browse archive",
          "action-href": "/archive"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_ArticleFeed, {
          articles: unref(filteredArticles),
          view: unref(view)
        }, null, _parent));
      }
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-CFsVva-c.js.map
