import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { _ as _sfc_main$4 } from "./MarkdownContent-BbiPhAn4.js";
import { defineComponent, mergeProps, useSSRContext, ref, withAsyncContext, unref, computed, withCtx, createTextVNode, toDisplayString } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _sfc_main$3 } from "./AppImage-CpDcJIeD.js";
import { q as fetchPublicComments, s as sortArticles, b as blogAuthor, d as formatDate, f as fetchPublicSiteSettings, r as fetchPublicArticleDetail, j as fetchAllPublicArticles } from "./api-9xEAR-2s.js";
import { u as useGeeTestCaptcha } from "./useGeeTestCaptcha-DFKF46Gm.js";
import { u as useAsyncData } from "./asyncData-BA1__WkK.js";
import { _ as _sfc_main$5 } from "./ArticleCard-BxTDfe5W.js";
import { _ as _sfc_main$6 } from "./EmptyState-6npZcwUe.js";
import { u as useRoute } from "../server.mjs";
import { a as useSeoMeta, u as useHead } from "./v3-CVe3IQuN.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CommentThread",
  __ssrInlineRender: true,
  props: {
    comments: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommentThread = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><!--[-->`);
      ssrRenderList(__props.comments, (comment) => {
        _push(`<div class="border-l border-[var(--blog-border)] pl-5"><div class="flex gap-4">`);
        _push(ssrRenderComponent(_sfc_main$3, {
          class: "h-10 w-10 rounded-full object-cover",
          src: comment.avatarUrl,
          alt: comment.nickname
        }, null, _parent));
        _push(`<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2"><span class="text-sm font-semibold text-[var(--blog-ink)]">${ssrInterpolate(comment.nickname)}</span><span class="text-xs text-[var(--blog-subtle)]">${ssrInterpolate(new Date(comment.createdAt).toLocaleDateString("zh-CN"))}</span></div><p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]">${ssrInterpolate(comment.content)}</p></div></div>`);
        if (comment.replies.length > 0) {
          _push(`<div class="mt-4 space-y-4">`);
          _push(ssrRenderComponent(_component_CommentThread, {
            comments: comment.replies
          }, null, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommentThread.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CommentSection",
  __ssrInlineRender: true,
  props: {
    articleSlug: {},
    allowComment: { type: Boolean }
  },
  async setup(__props) {
    let __temp, __restore;
    const props = __props;
    const nickname = ref("");
    const email = ref("");
    const website = ref("");
    const content = ref("");
    const message = ref("");
    const submitting = ref(false);
    const captchaEnabled = ref(false);
    const captchaId = ref(null);
    const { data: comments, refresh, pending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      () => `comments-${props.articleSlug}`,
      () => fetchPublicComments(props.articleSlug),
      "$i1PfjzarBq"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    useGeeTestCaptcha(
      captchaId
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CommentThread = _sfc_main$2;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "mt-16" }, _attrs))}><div class="flex items-center gap-3"><h2 class="text-2xl font-semibold text-[var(--blog-ink)]">Comments</h2><span class="rounded-full bg-[var(--blog-soft)] px-3 py-1 text-xs text-[var(--blog-subtle)]">${ssrInterpolate(unref(comments)?.length || 0)}</span></div>`);
      if (__props.allowComment) {
        _push(`<div class="blog-panel mt-8 rounded-none p-6 sm:rounded-[4px] md:p-8"><h3 class="text-lg font-semibold text-[var(--blog-ink)]">Share your thoughts</h3><form class="mt-5 space-y-4"><div class="grid gap-4 md:grid-cols-2"><input${ssrRenderAttr("value", unref(nickname))} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Name" required><input${ssrRenderAttr("value", unref(email))} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Email" type="email" required></div><input${ssrRenderAttr("value", unref(website))} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Website (optional)" type="url"><textarea class="min-h-32 w-full rounded-3xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm leading-7 outline-none" placeholder="Write a comment..." required>${ssrInterpolate(unref(content))}</textarea>`);
        if (unref(captchaEnabled)) {
          _push(`<p class="text-xs text-[var(--blog-muted)]"> GeeTest verification is required before this comment can be submitted. </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex flex-wrap items-center gap-3"><button class="blog-button-primary" type="submit"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""}>${ssrInterpolate(unref(submitting) ? "Submitting..." : "Post comment")}</button>`);
        if (unref(message)) {
          _push(`<span class="text-sm text-[var(--blog-muted)]">${ssrInterpolate(unref(message))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></form></div>`);
      } else {
        _push(`<div class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]"> Comments are disabled for this article. </div>`);
      }
      if (unref(pending)) {
        _push(`<div class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]"> Loading comments... </div>`);
      } else if (unref(comments) && unref(comments).length > 0) {
        _push(`<div class="mt-8 rounded-none border border-[var(--blog-border)] bg-white/88 px-4 py-6 sm:rounded-[4px] sm:px-6">`);
        _push(ssrRenderComponent(_component_CommentThread, { comments: unref(comments) }, null, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]"> No comments yet. Be the first to leave one. </div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CommentSection.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const slug = computed(() => String(route.params.slug || ""));
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings)), __temp = await __temp, __restore(), __temp);
    const { data: article } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      () => `article-${slug.value}`,
      () => fetchPublicArticleDetail(slug.value),
      "$8XbLJzcacz"
      /* nuxt-injected */
    )), __temp = await __temp, __restore(), __temp);
    const { data: allArticles } = useAsyncData("shared-all-articles", fetchAllPublicArticles, { lazy: true });
    const orderedArticles = computed(() => sortArticles(allArticles.value || [], "latest"));
    const articleIndex = computed(() => orderedArticles.value.findIndex((item) => item.slug === article.value?.slug));
    const olderArticle = computed(() => articleIndex.value >= 0 ? orderedArticles.value[articleIndex.value + 1] || null : null);
    const newerArticle = computed(() => articleIndex.value > 0 ? orderedArticles.value[articleIndex.value - 1] || null : null);
    const primaryCategory = computed(() => article.value?.categories?.[0] || null);
    const canonicalUrl = computed(() => {
      const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, "") || "";
      return article.value && base ? `${base}/articles/${article.value.slug}` : "";
    });
    const relatedArticles = computed(() => {
      if (!article.value) {
        return [];
      }
      const categorySlugs = new Set(article.value.categories.map((item) => item.slug));
      return orderedArticles.value.filter((item) => item.id !== article.value?.id && item.categories.some((cat) => categorySlugs.has(cat.slug))).slice(0, 3);
    });
    useSeoMeta({
      title: () => article.value?.title || "Article",
      description: () => article.value?.excerpt || siteSettings.value?.siteDescription || ""
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
      const _component_MarkdownContent = _sfc_main$4;
      const _component_CommentSection = _sfc_main$1;
      const _component_ArticleCard = _sfc_main$5;
      const _component_EmptyState = _sfc_main$6;
      if (unref(article)) {
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
        _push(`<span>/</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          class: "transition hover:text-[var(--blog-ink)]",
          to: "/articles"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Articles`);
            } else {
              return [
                createTextVNode("Articles")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<span>/</span><span>${ssrInterpolate(unref(primaryCategory)?.name || "Uncategorized")}</span></div><div class="mt-6 flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(article).tags, (item) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: item.id,
            class: "blog-filter",
            to: `/tags/${item.slug}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`#${ssrInterpolate(item.name)}`);
              } else {
                return [
                  createTextVNode("#" + toDisplayString(item.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div><div class="mt-8 max-w-4xl"><h1 class="text-2xl font-semibold leading-tight tracking-[-0.03em] text-[var(--blog-ink)] md:text-4xl">${ssrInterpolate(unref(article).title)}</h1><p class="mt-4 max-w-3xl text-base leading-8 text-[var(--blog-muted)]">${ssrInterpolate(unref(article).excerpt)}</p><ul class="mt-8 flex flex-wrap gap-4 text-sm text-[var(--blog-muted)]"><li>Author: ${ssrInterpolate(unref(blogAuthor).name)}</li><li>Category: ${ssrInterpolate(unref(article).categories.map((item) => item.name).join(" / ") || "Uncategorized")}</li><li>Published: ${ssrInterpolate(unref(formatDate)(unref(article).publishedAt))}</li><li>Reading time: ${ssrInterpolate(unref(article).readingTime)} min</li></ul></div></div><div class="border-t border-[var(--blog-border)]">`);
        _push(ssrRenderComponent(_component_MarkdownContent, {
          content: unref(article).content
        }, null, _parent));
        _push(`</div></div></section><section class="mx-auto max-w-7xl px-0 pt-0 sm:px-6"><div class="mt-8 blog-panel rounded-none px-6 py-6 sm:rounded-[4px] md:px-10 md:py-8">`);
        if (!unref(allArticles)) {
          _push(`<div class="text-center text-sm text-[var(--blog-subtle)]">Loading navigation...</div>`);
        } else {
          _push(`<div class="flex flex-col gap-5 md:flex-row md:justify-between md:gap-6"><div class="flex w-full flex-col text-[var(--blog-muted)] md:w-1/2"><span class="text-xs uppercase tracking-[0.18em] text-[var(--blog-subtle)]">Older post</span>`);
          if (unref(olderArticle)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "mt-2 inline-flex items-center gap-2 text-base font-medium leading-7 text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]",
              to: `/articles/${unref(olderArticle).slug}`
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(olderArticle).title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(olderArticle).title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "mt-2 text-base font-medium leading-7 text-[var(--blog-subtle)]",
              to: "/articles"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`Browse all articles`);
                } else {
                  return [
                    createTextVNode("Browse all articles")
                  ];
                }
              }),
              _: 1
            }, _parent));
          }
          _push(`</div><div class="flex w-full flex-col text-left text-[var(--blog-muted)] md:w-1/2 md:items-end"><span class="text-xs uppercase tracking-[0.18em] text-[var(--blog-subtle)]">Newer post</span>`);
          if (unref(newerArticle)) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "mt-2 inline-flex items-center gap-2 text-base font-medium leading-7 text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)] md:text-right",
              to: `/articles/${unref(newerArticle).slug}`
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(unref(newerArticle).title)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(unref(newerArticle).title), 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
          } else {
            _push(ssrRenderComponent(_component_NuxtLink, {
              class: "mt-2 text-base font-medium leading-7 text-[var(--blog-subtle)] md:text-right",
              to: "/articles"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`No newer article`);
                } else {
                  return [
                    createTextVNode("No newer article")
                  ];
                }
              }),
              _: 1
            }, _parent));
          }
          _push(`</div></div>`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_CommentSection, {
          "article-slug": unref(article).slug,
          "allow-comment": unref(article).allowComment
        }, null, _parent));
        _push(`</section>`);
        if (unref(relatedArticles).length > 0) {
          _push(`<section class="mt-16 border-t border-[var(--blog-border)] bg-white/70 py-16"><div class="mx-auto max-w-7xl px-0 sm:px-6"><div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Related</p><h2 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">Related reads</h2></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            class: "text-sm font-medium text-[var(--blog-accent)]",
            to: unref(primaryCategory) ? `/categories/${unref(primaryCategory).slug}` : "/articles"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` More in this category `);
              } else {
                return [
                  createTextVNode(" More in this category ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="mt-8 grid gap-4 md:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(relatedArticles), (item) => {
            _push(ssrRenderComponent(_component_ArticleCard, {
              key: item.id,
              article: item,
              variant: "compact"
            }, null, _parent));
          });
          _push(`<!--]--></div></div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "mx-auto max-w-4xl px-6 py-16" }, _attrs))}>`);
        _push(ssrRenderComponent(_component_EmptyState, {
          title: "Article not found",
          description: "The requested article is unavailable or has been removed.",
          "action-label": "Back to articles",
          "action-href": "/articles"
        }, null, _parent));
        _push(`</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/articles/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_slug_-m_0HVPn9.js.map
