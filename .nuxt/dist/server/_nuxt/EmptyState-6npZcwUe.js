import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { defineComponent, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EmptyState",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    actionLabel: {},
    actionHref: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "blog-panel p-8 text-center" }, _attrs))}><h2 class="text-2xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">${ssrInterpolate(__props.title)}</h2><p class="mx-auto mt-3 max-w-2xl text-sm leading-7 text-[var(--blog-muted)]">${ssrInterpolate(__props.description)}</p>`);
      if (__props.actionLabel && __props.actionHref) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: __props.actionHref,
          class: "blog-button-primary mt-6"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(__props.actionLabel)}`);
            } else {
              return [
                createTextVNode(toDisplayString(__props.actionLabel), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/EmptyState.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=EmptyState-6npZcwUe.js.map
