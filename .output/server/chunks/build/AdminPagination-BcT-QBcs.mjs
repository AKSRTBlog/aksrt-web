import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminPagination",
  __ssrInlineRender: true,
  props: {
    page: {},
    totalPages: {},
    total: {},
    label: { default: "\u6761\u6570\u636E" }
  },
  emits: ["update:page"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-pagination" }, _attrs))}><p class="text-sm text-slate-500"> \u5171 ${ssrInterpolate(__props.total)} ${ssrInterpolate(__props.label)}\uFF0C\u7B2C ${ssrInterpolate(__props.page)} / ${ssrInterpolate(__props.totalPages)} \u9875 </p><div class="flex items-center gap-2"><button class="admin-button-secondary" type="button"${ssrIncludeBooleanAttr(__props.page <= 1) ? " disabled" : ""}> \u4E0A\u4E00\u9875 </button><button class="admin-button-secondary" type="button"${ssrIncludeBooleanAttr(__props.page >= __props.totalPages) ? " disabled" : ""}> \u4E0B\u4E00\u9875 </button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminPagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminPagination-BcT-QBcs.mjs.map
