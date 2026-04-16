import { _ as _sfc_main$1 } from "./AdminArticleEditor-DHEmFyUW.js";
import { defineComponent, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useRoute } from "../server.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import "./AdminPageHeader-7bRWSeA5.js";
import "./nuxt-link-QV1LfQc6.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./AppImage-CpDcJIeD.js";
import "./MediaPickerDialog-CKbzUmQT.js";
import "./admin-media-DKXf4jjq.js";
import "./useAdminSession-fnHBOwsd.js";
import "./api-base-COxdl8qP.js";
import "./api-9xEAR-2s.js";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./admin-BhXx1q9A.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const articleId = computed(() => route.params.id);
    useHead({
      title: "编辑文章"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminArticleEditor = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-page-container" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminArticleEditor, { "article-id": unref(articleId) }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/articles/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_id_-CwtW6I_9.js.map
