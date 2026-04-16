import { _ as _sfc_main$1 } from './AdminArticleEditor-DHEmFyUW.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { u as useRoute } from './server.mjs';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import './AdminPageHeader-7bRWSeA5.mjs';
import './nuxt-link-QV1LfQc6.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './AppImage-CpDcJIeD.mjs';
import './MediaPickerDialog-CKbzUmQT.mjs';
import './admin-media-DKXf4jjq.mjs';
import './useAdminSession-fnHBOwsd.mjs';
import './api-base-COxdl8qP.mjs';
import './api-9xEAR-2s.mjs';
import 'marked';
import './admin-editor-CUf6Pf5Q.mjs';
import './admin-BhXx1q9A.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const articleId = computed(() => route.params.id);
    useHead({
      title: "\u7F16\u8F91\u6587\u7AE0"
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

export { _sfc_main as default };
//# sourceMappingURL=_id_-CwtW6I_9.mjs.map
