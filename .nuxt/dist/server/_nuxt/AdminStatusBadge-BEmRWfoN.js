import { defineComponent, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderSlot } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminStatusBadge",
  __ssrInlineRender: true,
  props: {
    tone: { default: "default" }
  },
  setup(__props) {
    const props = __props;
    const toneClass = computed(() => {
      if (props.tone === "success") {
        return "admin-badge-success";
      }
      if (props.tone === "warning") {
        return "admin-badge-warning";
      }
      if (props.tone === "danger") {
        return "admin-badge-danger";
      }
      return "admin-badge-default";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["admin-badge", unref(toneClass)]
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/admin/AdminStatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=AdminStatusBadge-BEmRWfoN.js.map
