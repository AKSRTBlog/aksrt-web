import { defineComponent, mergeProps, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminPagination",
  __ssrInlineRender: true,
  props: {
    page: {},
    totalPages: {},
    total: {},
    label: { default: "条数据" }
  },
  emits: ["update:page"],
  setup(__props, { emit: __emit }) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-pagination" }, _attrs))}><p class="text-sm text-slate-500"> 共 ${ssrInterpolate(__props.total)} ${ssrInterpolate(__props.label)}，第 ${ssrInterpolate(__props.page)} / ${ssrInterpolate(__props.totalPages)} 页 </p><div class="flex items-center gap-2"><button class="admin-button-secondary" type="button"${ssrIncludeBooleanAttr(__props.page <= 1) ? " disabled" : ""}> 上一页 </button><button class="admin-button-secondary" type="button"${ssrIncludeBooleanAttr(__props.page >= __props.totalPages) ? " disabled" : ""}> 下一页 </button></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminPagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=AdminPagination-BcT-QBcs.js.map
