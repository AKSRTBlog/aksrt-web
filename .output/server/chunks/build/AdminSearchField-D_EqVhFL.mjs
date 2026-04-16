import { defineComponent, useAttrs, useModel, mergeProps, unref, mergeModels, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrGetDynamicModelProps } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  ...{
    inheritAttrs: false
  },
  __name: "AdminSearchField",
  __ssrInlineRender: true,
  props: /* @__PURE__ */ mergeModels({
    placeholder: {}
  }, {
    "modelValue": { default: "" },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const attrs = useAttrs();
    const modelValue = useModel(__props, "modelValue");
    return (_ctx, _push, _parent, _attrs) => {
      let _temp0;
      _push(`<label${ssrRenderAttrs(mergeProps({ class: "admin-search-field" }, _attrs))}><svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z"></path></svg><input${ssrRenderAttrs((_temp0 = mergeProps({ value: modelValue.value }, unref(attrs), {
        class: "admin-input min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0",
        type: "search",
        placeholder: __props.placeholder
      }), mergeProps(_temp0, ssrGetDynamicModelProps(_temp0, modelValue.value))))}></label>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminSearchField.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminSearchField-D_EqVhFL.mjs.map
