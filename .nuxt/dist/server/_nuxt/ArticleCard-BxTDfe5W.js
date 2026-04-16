import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { defineComponent, mergeProps, withCtx, unref, openBlock, createBlock, createVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import { _ as _sfc_main$1 } from "./AppImage-CpDcJIeD.js";
import { d as formatDate, b as blogAuthor } from "./api-9xEAR-2s.js";
const uncategorizedLabel = "Uncategorized";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ArticleCard",
  __ssrInlineRender: true,
  props: {
    article: {},
    variant: { default: "default" }
  },
  setup(__props) {
    function estimateCardReadingTime(article) {
      return Math.max(1, Math.ceil((article.excerpt.length || 120) / 220));
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(ssrRenderComponent(_component_NuxtLink, mergeProps({
        to: `/articles/${__props.article.slug}`,
        class: "group block"
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.variant === "featured") {
              _push2(`<article class="blog-panel overflow-hidden"${_scopeId}><div class="relative aspect-[16/10] overflow-hidden"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$1, {
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                src: __props.article.coverImage,
                alt: __props.article.title,
                loading: "eager",
                fetchpriority: "high"
              }, null, _parent2, _scopeId));
              _push2(`<div class="absolute inset-0 bg-gradient-to-t from-[rgba(17,24,39,0.7)] via-transparent to-transparent"${_scopeId}></div><div class="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(__props.article.categories?.[0]?.name || uncategorizedLabel)}</div><div class="absolute bottom-5 left-5 right-5"${_scopeId}><h3 class="text-2xl font-semibold leading-tight tracking-[-0.03em] text-white"${_scopeId}>${ssrInterpolate(__props.article.title)}</h3></div></div><div class="p-6"${_scopeId}><p class="line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p><div class="mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--blog-subtle)]"${_scopeId}><span${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.article.publishedAt))}</span><span${_scopeId}>/</span><span${_scopeId}>${ssrInterpolate(estimateCardReadingTime(__props.article))} min read</span></div></div></article>`);
            } else if (__props.variant === "horizontal") {
              _push2(`<article class="flex items-stretch gap-3 py-5 sm:gap-4"${_scopeId}><div class="min-w-0 flex-1"${_scopeId}><h3 class="line-clamp-2 text-[0.95rem] font-semibold leading-[1.55] tracking-[-0.03em] text-[var(--blog-ink)] transition-colors group-hover:text-[var(--blog-accent)] sm:text-[1.12rem]"${_scopeId}>${ssrInterpolate(__props.article.title)}</h3><p class="mt-2 line-clamp-2 text-xs leading-7 text-[var(--blog-muted)]"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p><div class="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--blog-subtle)] sm:text-xs"${_scopeId}><span class="hidden font-medium text-[var(--blog-accent)] sm:inline"${_scopeId}>${ssrInterpolate(__props.article.categories?.[0]?.name || uncategorizedLabel)}</span><span class="hidden sm:inline text-[var(--blog-border-strong)]"${_scopeId}>/</span><span class="hidden sm:inline"${_scopeId}>${ssrInterpolate(unref(blogAuthor).name)}</span><span class="hidden sm:inline text-[var(--blog-border-strong)]"${_scopeId}>/</span><span${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.article.publishedAt))}</span></div></div><div class="w-[30%] shrink-0 sm:w-36 md:w-64"${_scopeId}><div class="h-[88px] overflow-hidden rounded-[3px] sm:h-[104px] md:h-[140px]"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$1, {
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                src: __props.article.coverImage,
                alt: __props.article.title
              }, null, _parent2, _scopeId));
              _push2(`</div></div></article>`);
            } else if (__props.variant === "compact") {
              _push2(`<article class="flex items-start gap-4 rounded-[4px] border border-[var(--blog-border)] bg-white/88 p-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$1, {
                class: "h-16 w-16 rounded-[4px] object-cover",
                src: __props.article.coverImage,
                alt: __props.article.title
              }, null, _parent2, _scopeId));
              _push2(`<div class="min-w-0 flex-1"${_scopeId}><p class="text-xs font-medium text-[var(--blog-accent)]"${_scopeId}>${ssrInterpolate(__props.article.categories?.[0]?.name || uncategorizedLabel)}</p><h4 class="mt-1 line-clamp-2 text-sm font-semibold text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(__props.article.title)}</h4><p class="mt-2 text-xs text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.article.publishedAt))} / ${ssrInterpolate(estimateCardReadingTime(__props.article))} min read</p></div></article>`);
            } else {
              _push2(`<article class="blog-panel overflow-hidden"${_scopeId}><div class="aspect-[4/3] overflow-hidden"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$1, {
                class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                src: __props.article.coverImage,
                alt: __props.article.title
              }, null, _parent2, _scopeId));
              _push2(`</div><div class="p-6"${_scopeId}><div class="flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--blog-accent)]"${_scopeId}><span${_scopeId}>${ssrInterpolate(__props.article.categories?.[0]?.name || uncategorizedLabel)}</span><span class="text-[var(--blog-border-strong)]"${_scopeId}>/</span><span class="text-[var(--blog-subtle)]"${_scopeId}>${ssrInterpolate(unref(formatDate)(__props.article.publishedAt))}</span></div><h3 class="mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-[var(--blog-ink)]"${_scopeId}>${ssrInterpolate(__props.article.title)}</h3><p class="mt-3 line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]"${_scopeId}>${ssrInterpolate(__props.article.excerpt)}</p></div></article>`);
            }
          } else {
            return [
              __props.variant === "featured" ? (openBlock(), createBlock("article", {
                key: 0,
                class: "blog-panel overflow-hidden"
              }, [
                createVNode("div", { class: "relative aspect-[16/10] overflow-hidden" }, [
                  createVNode(_sfc_main$1, {
                    class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                    src: __props.article.coverImage,
                    alt: __props.article.title,
                    loading: "eager",
                    fetchpriority: "high"
                  }, null, 8, ["src", "alt"]),
                  createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-[rgba(17,24,39,0.7)] via-transparent to-transparent" }),
                  createVNode("div", { class: "absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[var(--blog-ink)]" }, toDisplayString(__props.article.categories?.[0]?.name || uncategorizedLabel), 1),
                  createVNode("div", { class: "absolute bottom-5 left-5 right-5" }, [
                    createVNode("h3", { class: "text-2xl font-semibold leading-tight tracking-[-0.03em] text-white" }, toDisplayString(__props.article.title), 1)
                  ])
                ]),
                createVNode("div", { class: "p-6" }, [
                  createVNode("p", { class: "line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]" }, toDisplayString(__props.article.excerpt), 1),
                  createVNode("div", { class: "mt-5 flex flex-wrap items-center gap-3 text-xs text-[var(--blog-subtle)]" }, [
                    createVNode("span", null, toDisplayString(unref(formatDate)(__props.article.publishedAt)), 1),
                    createVNode("span", null, "/"),
                    createVNode("span", null, toDisplayString(estimateCardReadingTime(__props.article)) + " min read", 1)
                  ])
                ])
              ])) : __props.variant === "horizontal" ? (openBlock(), createBlock("article", {
                key: 1,
                class: "flex items-stretch gap-3 py-5 sm:gap-4"
              }, [
                createVNode("div", { class: "min-w-0 flex-1" }, [
                  createVNode("h3", { class: "line-clamp-2 text-[0.95rem] font-semibold leading-[1.55] tracking-[-0.03em] text-[var(--blog-ink)] transition-colors group-hover:text-[var(--blog-accent)] sm:text-[1.12rem]" }, toDisplayString(__props.article.title), 1),
                  createVNode("p", { class: "mt-2 line-clamp-2 text-xs leading-7 text-[var(--blog-muted)]" }, toDisplayString(__props.article.excerpt), 1),
                  createVNode("div", { class: "mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--blog-subtle)] sm:text-xs" }, [
                    createVNode("span", { class: "hidden font-medium text-[var(--blog-accent)] sm:inline" }, toDisplayString(__props.article.categories?.[0]?.name || uncategorizedLabel), 1),
                    createVNode("span", { class: "hidden sm:inline text-[var(--blog-border-strong)]" }, "/"),
                    createVNode("span", { class: "hidden sm:inline" }, toDisplayString(unref(blogAuthor).name), 1),
                    createVNode("span", { class: "hidden sm:inline text-[var(--blog-border-strong)]" }, "/"),
                    createVNode("span", null, toDisplayString(unref(formatDate)(__props.article.publishedAt)), 1)
                  ])
                ]),
                createVNode("div", { class: "w-[30%] shrink-0 sm:w-36 md:w-64" }, [
                  createVNode("div", { class: "h-[88px] overflow-hidden rounded-[3px] sm:h-[104px] md:h-[140px]" }, [
                    createVNode(_sfc_main$1, {
                      class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                      src: __props.article.coverImage,
                      alt: __props.article.title
                    }, null, 8, ["src", "alt"])
                  ])
                ])
              ])) : __props.variant === "compact" ? (openBlock(), createBlock("article", {
                key: 2,
                class: "flex items-start gap-4 rounded-[4px] border border-[var(--blog-border)] bg-white/88 p-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"
              }, [
                createVNode(_sfc_main$1, {
                  class: "h-16 w-16 rounded-[4px] object-cover",
                  src: __props.article.coverImage,
                  alt: __props.article.title
                }, null, 8, ["src", "alt"]),
                createVNode("div", { class: "min-w-0 flex-1" }, [
                  createVNode("p", { class: "text-xs font-medium text-[var(--blog-accent)]" }, toDisplayString(__props.article.categories?.[0]?.name || uncategorizedLabel), 1),
                  createVNode("h4", { class: "mt-1 line-clamp-2 text-sm font-semibold text-[var(--blog-ink)]" }, toDisplayString(__props.article.title), 1),
                  createVNode("p", { class: "mt-2 text-xs text-[var(--blog-subtle)]" }, toDisplayString(unref(formatDate)(__props.article.publishedAt)) + " / " + toDisplayString(estimateCardReadingTime(__props.article)) + " min read", 1)
                ])
              ])) : (openBlock(), createBlock("article", {
                key: 3,
                class: "blog-panel overflow-hidden"
              }, [
                createVNode("div", { class: "aspect-[4/3] overflow-hidden" }, [
                  createVNode(_sfc_main$1, {
                    class: "h-full w-full object-cover transition duration-500 group-hover:scale-105",
                    src: __props.article.coverImage,
                    alt: __props.article.title
                  }, null, 8, ["src", "alt"])
                ]),
                createVNode("div", { class: "p-6" }, [
                  createVNode("div", { class: "flex flex-wrap items-center gap-2 text-xs font-medium text-[var(--blog-accent)]" }, [
                    createVNode("span", null, toDisplayString(__props.article.categories?.[0]?.name || uncategorizedLabel), 1),
                    createVNode("span", { class: "text-[var(--blog-border-strong)]" }, "/"),
                    createVNode("span", { class: "text-[var(--blog-subtle)]" }, toDisplayString(unref(formatDate)(__props.article.publishedAt)), 1)
                  ]),
                  createVNode("h3", { class: "mt-3 text-xl font-semibold leading-tight tracking-[-0.03em] text-[var(--blog-ink)]" }, toDisplayString(__props.article.title), 1),
                  createVNode("p", { class: "mt-3 line-clamp-3 text-sm leading-7 text-[var(--blog-muted)]" }, toDisplayString(__props.article.excerpt), 1)
                ])
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ArticleCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=ArticleCard-BxTDfe5W.js.map
