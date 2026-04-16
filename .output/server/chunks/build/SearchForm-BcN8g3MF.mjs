import { defineComponent, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "SearchForm",
  __ssrInlineRender: true,
  props: {
    initialValue: { default: "" },
    placeholder: { default: "Search articles, tags, or topics" },
    className: { default: "" }
  },
  setup(__props) {
    const props = __props;
    const keyword = ref(props.initialValue);
    watch(
      () => props.initialValue,
      (value) => {
        keyword.value = value;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(mergeProps({
        class: `flex w-full items-center gap-3 rounded-[4px] border border-[var(--blog-border)] bg-white/92 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${__props.className}`.trim()
      }, _attrs))}><span class="text-[var(--blog-muted)]">Q</span><input${ssrRenderAttr("value", unref(keyword))} class="w-full bg-transparent text-sm text-[var(--blog-ink)] outline-none placeholder:text-[var(--blog-subtle)]" type="search"${ssrRenderAttr("placeholder", __props.placeholder)}><button class="blog-button-primary shrink-0" type="submit">Search</button></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SearchForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=SearchForm-BcN8g3MF.mjs.map
