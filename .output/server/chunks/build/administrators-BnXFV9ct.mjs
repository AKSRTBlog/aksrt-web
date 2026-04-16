import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { defineComponent, ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { a as useHead } from './v3-CVe3IQuN.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
import { a as useRouter } from './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';
import './api-base-COxdl8qP.mjs';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "administrators",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u7BA1\u7406\u5458\u8BBE\u7F6E"
    });
    useAdminSession();
    useRouter();
    const loading = ref(true);
    const saving = ref(false);
    const changingPassword = ref(false);
    const error = ref("");
    const successMessage = ref("");
    const profileForm = ref({
      username: "",
      email: "",
      displayName: ""
    });
    const passwordForm = ref({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u7BA1\u7406\u5458\u8BBE\u7F6E",
        description: "\u7BA1\u7406\u767B\u5F55\u8D26\u6237\u4FE1\u606F\u548C\u5B89\u5168\u8BBE\u7F6E\u3002"
      }, null, _parent));
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
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D... </div>`);
      } else {
        _push(`<div class="grid gap-6 xl:grid-cols-2"><section class="admin-card flex h-full flex-col p-6"><div class="mb-6 flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div><div><h3 class="text-lg font-semibold text-slate-900">\u8D26\u6237\u4FE1\u606F</h3><p class="text-sm text-slate-500">\u4FEE\u6539\u60A8\u7684\u767B\u5F55\u90AE\u7BB1\u3001\u7528\u6237\u540D\u548C\u663E\u793A\u540D\u79F0\u3002</p></div></div><div class="flex flex-1 flex-col"><div class="space-y-6"><div><label class="mb-2 block text-sm font-medium text-slate-700">\u7528\u6237\u540D</label><input${ssrRenderAttr("value", unref(profileForm).username)} type="text" class="admin-input w-full" placeholder="\u8F93\u5165\u7528\u6237\u540D"><p class="mt-1 text-xs text-slate-500">\u7528\u4E8E\u767B\u5F55\u540E\u53F0\u7BA1\u7406\u7CFB\u7EDF</p></div><div><label class="mb-2 block text-sm font-medium text-slate-700">\u90AE\u7BB1\u5730\u5740</label><input${ssrRenderAttr("value", unref(profileForm).email)} type="email" class="admin-input w-full" placeholder="\u8F93\u5165\u90AE\u7BB1\u5730\u5740"><p class="mt-1 text-xs text-slate-500">\u7528\u4E8E\u63A5\u6536\u7CFB\u7EDF\u901A\u77E5\u548C\u5BC6\u7801\u91CD\u7F6E</p></div><div><label class="mb-2 block text-sm font-medium text-slate-700">\u663E\u793A\u540D\u79F0</label><input${ssrRenderAttr("value", unref(profileForm).displayName)} type="text" class="admin-input w-full" placeholder="\u8F93\u5165\u663E\u793A\u540D\u79F0"><p class="mt-1 text-xs text-slate-500">\u663E\u793A\u5728\u540E\u53F0\u754C\u9762\u4E2D\u7684\u540D\u79F0</p></div></div><div class="mt-auto flex gap-3 pt-6"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> ${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u4FEE\u6539")}</button></div></div></section><section class="admin-card flex h-full flex-col p-6"><div class="mb-6 flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"><svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg></div><div><h3 class="text-lg font-semibold text-slate-900">\u4FEE\u6539\u5BC6\u7801</h3><p class="text-sm text-slate-500">\u5B9A\u671F\u66F4\u65B0\u5BC6\u7801\u53EF\u4EE5\u63D0\u5347\u8D26\u6237\u5B89\u5168\u6027\u3002</p></div></div><div class="flex flex-1 flex-col"><div class="space-y-6"><div><label class="mb-2 block text-sm font-medium text-slate-700">\u5F53\u524D\u5BC6\u7801</label><input${ssrRenderAttr("value", unref(passwordForm).currentPassword)} type="password" class="admin-input w-full" placeholder="\u8F93\u5165\u5F53\u524D\u5BC6\u7801"></div><div><label class="mb-2 block text-sm font-medium text-slate-700">\u65B0\u5BC6\u7801</label><input${ssrRenderAttr("value", unref(passwordForm).newPassword)} type="password" class="admin-input w-full" placeholder="\u8F93\u5165\u65B0\u5BC6\u7801\uFF08\u81F3\u5C11 8 \u4F4D\uFF09"></div><div><label class="mb-2 block text-sm font-medium text-slate-700">\u786E\u8BA4\u65B0\u5BC6\u7801</label><input${ssrRenderAttr("value", unref(passwordForm).confirmPassword)} type="password" class="admin-input w-full" placeholder="\u518D\u6B21\u8F93\u5165\u65B0\u5BC6\u7801"></div></div><div class="mt-auto flex gap-3 pt-6"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(changingPassword) || !unref(passwordForm).currentPassword || !unref(passwordForm).newPassword) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg> ${ssrInterpolate(unref(changingPassword) ? "\u4FEE\u6539\u4E2D..." : "\u4FEE\u6539\u5BC6\u7801")}</button></div></div></section></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/administrators.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=administrators-BnXFV9ct.mjs.map
