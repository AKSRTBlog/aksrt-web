import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { _ as _sfc_main$2 } from "./AdminArticleEditor-DHEmFyUW.js";
import { a as adminPaths } from "./admin-BhXx1q9A.js";
import { defineComponent, mergeProps, withCtx, unref, createTextVNode, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "./AppImage-CpDcJIeD.js";
import "./MediaPickerDialog-CKbzUmQT.js";
import "./admin-media-DKXf4jjq.js";
import "./useAdminSession-fnHBOwsd.js";
import "./api-base-COxdl8qP.js";
import "./api-9xEAR-2s.js";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
function useAdminPaths() {
  return adminPaths;
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "新建文章"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminArticleEditor = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-page-container" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "新建文章",
        description: "创建一个新的文章草稿或直接发布。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: ("useAdminPaths" in _ctx ? _ctx.useAdminPaths : unref(useAdminPaths))().articles
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` 返回列表 `);
                } else {
                  return [
                    createTextVNode(" 返回列表 ")
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
                  createTextVNode(" 返回列表 ")
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
export {
  _sfc_main as default
};
//# sourceMappingURL=new-Dtx1O98M.js.map
