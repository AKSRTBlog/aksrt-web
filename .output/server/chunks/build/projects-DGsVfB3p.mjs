import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { defineComponent, ref, mergeProps, withCtx, createVNode, openBlock, createBlock, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr, ssrRenderAttr } from 'vue/server-renderer';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import './server.mjs';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import 'vue-router';
import './api-base-COxdl8qP.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "projects",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u9879\u76EE\u7BA1\u7406"
    });
    useAdminSession();
    const items = ref([]);
    const loading = ref(true);
    const saving = ref(false);
    const error = ref("");
    const successMessage = ref("");
    function addProject() {
      const newItem = {
        id: `temp-${Date.now()}`,
        title: "",
        description: "",
        icon: null,
        link: "https://github.com/",
        sortOrder: items.value.length,
        enabled: true,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      items.value = [...items.value, newItem];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u9879\u76EE\u7BA1\u7406",
        description: "\u7BA1\u7406\u5C55\u793A\u5728\u5173\u4E8E\u9875\u9762\u7684\u9879\u76EE\u5361\u7247\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<button class="admin-button-primary" type="button"${_scopeId}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"${_scopeId}></path></svg> \u6DFB\u52A0\u9879\u76EE </button>`);
          } else {
            return [
              createVNode("button", {
                class: "admin-button-primary",
                type: "button",
                onClick: addProject
              }, [
                (openBlock(), createBlock("svg", {
                  class: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  viewBox: "0 0 24 24"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M12 4v16m8-8H4"
                  })
                ])),
                createTextVNode(" \u6DFB\u52A0\u9879\u76EE ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="rounded-[4px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="rounded-[4px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">${ssrInterpolate(unref(successMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u9879\u76EE... </div>`);
      } else {
        _push(`<div class="space-y-4">`);
        if (unref(items).length === 0) {
          _push(`<div class="admin-card p-8 text-center text-sm text-slate-500"> \u6682\u65E0\u9879\u76EE\uFF0C\u70B9\u51FB\u4E0A\u65B9\u201C\u6DFB\u52A0\u9879\u76EE\u201D\u6309\u94AE\u5F00\u59CB\u914D\u7F6E\u3002 </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(items), (item, index) => {
          var _a;
          _push(`<div class="admin-card p-6"><div class="mb-4 flex items-center justify-between"><div class="flex items-center gap-2"><svg class="h-4 w-4 cursor-move text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path></svg><span class="text-sm font-medium text-slate-700">\u9879\u76EE #${ssrInterpolate(index + 1)}</span></div><div class="flex items-center gap-2"><button class="admin-button-secondary text-xs"${ssrIncludeBooleanAttr(index === 0) ? " disabled" : ""} type="button"> \u4E0A\u79FB </button><button class="admin-button-secondary text-xs"${ssrIncludeBooleanAttr(index === unref(items).length - 1) ? " disabled" : ""} type="button"> \u4E0B\u79FB </button><button class="admin-button-danger text-xs" type="button"><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"></path></svg> \u5220\u9664 </button></div></div><div class="grid gap-4 md:grid-cols-2"><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u6807\u9898 *</label><input${ssrRenderAttr("value", item.title)} class="admin-input" placeholder="\u9879\u76EE\u540D\u79F0"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u94FE\u63A5 *</label><input${ssrRenderAttr("value", item.link)} class="admin-input" type="url" placeholder="https://github.com/user/repo"></div><div><label class="mb-1.5 block text-sm font-medium text-slate-700">\u56FE\u6807 URL</label><input${ssrRenderAttr("value", (_a = item.icon) != null ? _a : "")} class="admin-input" type="url" placeholder="https://example.com/icon.png"><p class="mt-1 text-xs text-slate-500">\u53EF\u9009\uFF0C\u7559\u7A7A\u65F6\u4F1A\u663E\u793A\u9ED8\u8BA4\u56FE\u6807\u3002</p></div><div class="flex items-center"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(item.enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528\u6B64\u9879\u76EE</span></label></div><div class="md:col-span-2"><label class="mb-1.5 block text-sm font-medium text-slate-700">\u7B80\u4ECB *</label><textarea class="admin-textarea" rows="3" placeholder="\u9879\u76EE\u7B80\u4ECB\u63CF\u8FF0">${ssrInterpolate(item.description)}</textarea></div></div>`);
          if (item.link) {
            _push(`<div class="mt-4 border-t border-[var(--admin-border)] pt-4"><a${ssrRenderAttr("href", item.link)} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"><svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg> \u9884\u89C8\u94FE\u63A5 </a></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving) || unref(items).length === 0) ? " disabled" : ""} type="button">${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u914D\u7F6E")}</button></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/projects.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=projects-DGsVfB3p.mjs.map
