import { defineComponent, ref, computed, watch, nextTick, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';

const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppImage",
  __ssrInlineRender: true,
  props: {
    src: { default: "" },
    alt: { default: "" },
    loading: { default: "lazy" },
    decoding: { default: "async" },
    fetchpriority: { default: "auto" }
  },
  setup(__props) {
    const props = __props;
    const imageRef = ref(null);
    const loaded = ref(false);
    const safeSrc = computed(() => typeof props.src === "string" ? props.src.trim() : "");
    const displaySrc = computed(() => safeSrc.value || transparentPixel);
    function syncLoadedState() {
      var _a;
      if ((_a = imageRef.value) == null ? void 0 : _a.complete) {
        loaded.value = true;
      }
    }
    watch(displaySrc, async () => {
      loaded.value = false;
      await nextTick();
      syncLoadedState();
    }, { immediate: true });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<img${ssrRenderAttrs(mergeProps({
        ref_key: "imageRef",
        ref: imageRef,
        src: unref(displaySrc),
        alt: __props.alt,
        loading: __props.loading,
        decoding: __props.decoding,
        fetchpriority: __props.fetchpriority,
        class: [
          "transition-[opacity,filter] duration-500 motion-reduce:transition-none",
          unref(loaded) && unref(safeSrc) ? "opacity-100 blur-0" : "bg-slate-200/70"
        ]
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppImage.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AppImage-CpDcJIeD.mjs.map
