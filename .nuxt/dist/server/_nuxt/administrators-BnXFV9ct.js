import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { defineComponent, ref, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr } from "vue/server-renderer";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import { a as useRouter } from "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "administrators",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "管理员设置"
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
        title: "管理员设置",
        description: "管理登录账户信息和安全设置。"
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
        _push(`<div class="admin-card p-6 text-center text-sm text-slate-500"> 正在加载... </div>`);
      } else {
        _push(`<div class="grid gap-6 xl:grid-cols-2"><section class="admin-card flex h-full flex-col p-6"><div class="mb-6 flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100"><svg class="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div><div><h3 class="text-lg font-semibold text-slate-900">账户信息</h3><p class="text-sm text-slate-500">修改您的登录邮箱、用户名和显示名称。</p></div></div><div class="flex flex-1 flex-col"><div class="space-y-6"><div><label class="mb-2 block text-sm font-medium text-slate-700">用户名</label><input${ssrRenderAttr("value", unref(profileForm).username)} type="text" class="admin-input w-full" placeholder="输入用户名"><p class="mt-1 text-xs text-slate-500">用于登录后台管理系统</p></div><div><label class="mb-2 block text-sm font-medium text-slate-700">邮箱地址</label><input${ssrRenderAttr("value", unref(profileForm).email)} type="email" class="admin-input w-full" placeholder="输入邮箱地址"><p class="mt-1 text-xs text-slate-500">用于接收系统通知和密码重置</p></div><div><label class="mb-2 block text-sm font-medium text-slate-700">显示名称</label><input${ssrRenderAttr("value", unref(profileForm).displayName)} type="text" class="admin-input w-full" placeholder="输入显示名称"><p class="mt-1 text-xs text-slate-500">显示在后台界面中的名称</p></div></div><div class="mt-auto flex gap-3 pt-6"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg> ${ssrInterpolate(unref(saving) ? "保存中..." : "保存修改")}</button></div></div></section><section class="admin-card flex h-full flex-col p-6"><div class="mb-6 flex items-center gap-4"><div class="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"><svg class="h-8 w-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg></div><div><h3 class="text-lg font-semibold text-slate-900">修改密码</h3><p class="text-sm text-slate-500">定期更新密码可以提升账户安全性。</p></div></div><div class="flex flex-1 flex-col"><div class="space-y-6"><div><label class="mb-2 block text-sm font-medium text-slate-700">当前密码</label><input${ssrRenderAttr("value", unref(passwordForm).currentPassword)} type="password" class="admin-input w-full" placeholder="输入当前密码"></div><div><label class="mb-2 block text-sm font-medium text-slate-700">新密码</label><input${ssrRenderAttr("value", unref(passwordForm).newPassword)} type="password" class="admin-input w-full" placeholder="输入新密码（至少 8 位）"></div><div><label class="mb-2 block text-sm font-medium text-slate-700">确认新密码</label><input${ssrRenderAttr("value", unref(passwordForm).confirmPassword)} type="password" class="admin-input w-full" placeholder="再次输入新密码"></div></div><div class="mt-auto flex gap-3 pt-6"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(changingPassword) || !unref(passwordForm).currentPassword || !unref(passwordForm).newPassword) ? " disabled" : ""}><svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg> ${ssrInterpolate(unref(changingPassword) ? "修改中..." : "修改密码")}</button></div></div></section></div>`);
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
export {
  _sfc_main as default
};
//# sourceMappingURL=administrators-BnXFV9ct.js.map
