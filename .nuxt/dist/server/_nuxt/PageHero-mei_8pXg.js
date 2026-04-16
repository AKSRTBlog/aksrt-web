import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "PageHero",
  __ssrInlineRender: true,
  props: {
    eyebrow: {},
    title: {},
    description: {},
    centered: { type: Boolean },
    statLabel: {},
    statValue: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: `mx-auto grid max-w-6xl gap-8 px-0 py-14 sm:px-6 ${__props.centered ? "justify-items-center text-center md:grid-cols-1" : "md:grid-cols-[minmax(0,1fr)_300px] md:items-end"}`
      }, _attrs))}><div class="${ssrRenderClass(__props.centered ? "mx-auto max-w-3xl" : "")}">`);
      if (__props.eyebrow) {
        _push(`<p class="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-accent)]">${ssrInterpolate(__props.eyebrow)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<h1 class="text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--blog-ink)] md:text-5xl">${ssrInterpolate(__props.title)}</h1><p class="mt-5 max-w-2xl text-base leading-8 text-[var(--blog-muted)] md:text-lg">${ssrInterpolate(__props.description)}</p></div>`);
      if (__props.statLabel) {
        _push(`<div class="blog-panel h-full p-6"><p class="text-sm text-[var(--blog-muted)]">${ssrInterpolate(__props.statLabel)}</p><p class="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[var(--blog-ink)]">${ssrInterpolate(__props.statValue)}</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PageHero.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=PageHero-mei_8pXg.js.map
