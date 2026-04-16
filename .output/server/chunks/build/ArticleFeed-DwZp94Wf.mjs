import { _ as _sfc_main$1 } from './ArticleCard-BxTDfe5W.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ArticleFeed",
  __ssrInlineRender: true,
  props: {
    articles: {},
    view: { default: "list" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ArticleCard = _sfc_main$1;
      if (__props.view === "grid") {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "grid gap-6 md:grid-cols-2" }, _attrs))}><!--[-->`);
        ssrRenderList(__props.articles, (article) => {
          _push(ssrRenderComponent(_component_ArticleCard, {
            key: article.id,
            article
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "overflow-hidden rounded-none border border-[var(--blog-border)] bg-white/88 sm:rounded-[4px]" }, _attrs))}><div class="divide-y divide-[var(--blog-border)] px-4 sm:px-6"><!--[-->`);
        ssrRenderList(__props.articles, (article) => {
          _push(ssrRenderComponent(_component_ArticleCard, {
            key: article.id,
            article,
            variant: "horizontal"
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ArticleFeed.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ArticleFeed-DwZp94Wf.mjs.map
