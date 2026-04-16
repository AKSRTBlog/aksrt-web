import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { _ as _sfc_main$2 } from './AdminArticleEditor-DHEmFyUW.mjs';
import { a as adminPaths } from './admin-BhXx1q9A.mjs';
import { defineComponent, mergeProps, withCtx, unref, createTextVNode, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './AppImage-CpDcJIeD.mjs';
import './MediaPickerDialog-CKbzUmQT.mjs';
import './admin-media-DKXf4jjq.mjs';
import './useAdminSession-fnHBOwsd.mjs';
import './api-base-COxdl8qP.mjs';
import './api-9xEAR-2s.mjs';
import 'marked';
import './admin-editor-CUf6Pf5Q.mjs';

function useAdminPaths() {
  return adminPaths;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u65B0\u5EFA\u6587\u7AE0"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminArticleEditor = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-page-container" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u65B0\u5EFA\u6587\u7AE0",
        description: "\u521B\u5EFA\u4E00\u4E2A\u65B0\u7684\u6587\u7AE0\u8349\u7A3F\u6216\u76F4\u63A5\u53D1\u5E03\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: ("useAdminPaths" in _ctx ? _ctx.useAdminPaths : unref(useAdminPaths))().articles
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u8FD4\u56DE\u5217\u8868 `);
                } else {
                  return [
                    createTextVNode(" \u8FD4\u56DE\u5217\u8868 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                class: "admin-button-secondary",
                to: ("useAdminPaths" in _ctx ? _ctx.useAdminPaths : unref(useAdminPaths))().articles
              }, {
                default: withCtx(() => [
                  createTextVNode(" \u8FD4\u56DE\u5217\u8868 ")
                ]),
                _: 1
              }, 8, ["to"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminArticleEditor, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/articles/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=new-Dtx1O98M.mjs.map
