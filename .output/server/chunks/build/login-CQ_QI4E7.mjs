import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useGeeTestCaptcha } from './useGeeTestCaptcha-DFKF46Gm.mjs';
import { u as useAdminSession } from './useAdminSession-fnHBOwsd.mjs';
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
import './api-base-COxdl8qP.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Admin Login",
      meta: [
        {
          name: "robots",
          content: "noindex, nofollow"
        }
      ]
    });
    const username = ref("");
    const password = ref("");
    const remember = ref(true);
    const submitting = ref(false);
    const errorMessage = ref("");
    ref(false);
    const captchaId = ref(null);
    useAdminSession();
    useGeeTestCaptcha(
      captchaId
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-950 px-6 py-10 text-white" }, _attrs))}><div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><section class="space-y-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300"> \u5B89 </span> \u540E\u53F0\u4EC5\u9762\u5411\u7BA1\u7406\u5458\u5F00\u653E </div><div><h1 class="max-w-2xl text-5xl font-semibold leading-tight tracking-[-0.05em] text-white md:text-6xl"> \u7528\u66F4\u96C6\u4E2D\u7684\u540E\u53F0\u5165\u53E3\uFF0C\u7BA1\u7406\u6587\u7AE0\u3001\u8BC4\u8BBA\u3001\u5A92\u4F53\u4E0E\u7AD9\u70B9\u8BBE\u7F6E\u3002 </h1><p class="mt-6 max-w-xl text-base leading-8 text-slate-300"> \u767B\u5F55\u540E\u5373\u53EF\u8FDB\u5165\u7EDF\u4E00\u540E\u53F0\uFF0C\u5185\u5BB9\u53D1\u5E03\u3001\u8BC4\u8BBA\u5BA1\u6838\u3001Banner\u3001SMTP \u4E0E\u5B58\u50A8\u914D\u7F6E\u90FD\u5DF2\u7ECF\u63A5\u5165\u65B0\u7684 Rust + PostgreSQL \u540E\u7AEF\u3002 </p></div><div class="grid gap-4 md:grid-cols-3"><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">\u7EDF\u4E00\u5165\u53E3</p><p class="mt-2 text-sm leading-7 text-slate-300">Nuxt \u5DF2\u63A5\u7BA1\u540E\u53F0\u8DEF\u7531\uFF0C\u767B\u5F55\u540E\u53EF\u76F4\u63A5\u8FDB\u5165\u5404\u7BA1\u7406\u6A21\u5757\u3002</p></div><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">\u65B0\u540E\u7AEF</p><p class="mt-2 text-sm leading-7 text-slate-300">\u540E\u53F0\u63A5\u53E3\u5DF2\u8FD0\u884C\u5728 Rust + PostgreSQL \u4E0A\uFF0C\u6570\u636E\u6D41\u4E0D\u518D\u4F9D\u8D56\u65E7 Node API\u3002</p></div><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">\u6E10\u8FDB\u8FC1\u79FB</p><p class="mt-2 text-sm leading-7 text-slate-300">\u539F\u751F Nuxt \u9875\u9762\u4F1A\u9010\u6B65\u66FF\u6362\u65E7\u540E\u53F0\u9875\u9762\uFF0C\u4E0D\u5F71\u54CD\u73B0\u6709\u529F\u80FD\u7EE7\u7EED\u4F7F\u7528\u3002</p></div></div></section><section class="admin-card mx-auto w-full max-w-xl p-8 text-slate-900"><div class="mb-8 flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-[4px] bg-blue-600 text-white"> \u767B </div><div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Login</p><h2 class="mt-1 text-2xl font-semibold tracking-[-0.03em]">\u7BA1\u7406\u5458\u767B\u5F55</h2></div></div><form class="space-y-5"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">\u7528\u6237\u540D</span><input${ssrRenderAttr("value", unref(username))} class="admin-input" autocomplete="username"></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">\u767B\u5F55\u5BC6\u7801</span><input${ssrRenderAttr("value", unref(password))} class="admin-input" type="password" autocomplete="current-password"></label><label class="flex items-center gap-3 text-sm text-slate-600"><input${ssrIncludeBooleanAttr(Array.isArray(unref(remember)) ? ssrLooseContain(unref(remember), null) : unref(remember)) ? " checked" : ""} type="checkbox"> \u8BB0\u4F4F\u5F53\u524D\u8BBE\u5907 </label>`);
      if (unref(errorMessage)) {
        _push(`<p class="text-sm text-rose-600">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="admin-button-primary w-full"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} type="submit">${ssrInterpolate(unref(submitting) ? "\u767B\u5F55\u4E2D..." : "\u8FDB\u5165\u7BA1\u7406\u540E\u53F0")}</button></form><div class="mt-6 flex items-center justify-end text-sm text-slate-500">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "font-medium text-blue-600",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u8FD4\u56DE\u535A\u5BA2\u524D\u53F0`);
          } else {
            return [
              createTextVNode("\u8FD4\u56DE\u535A\u5BA2\u524D\u53F0")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></section></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-CQ_QI4E7.mjs.map
