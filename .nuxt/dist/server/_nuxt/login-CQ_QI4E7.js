import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderComponent } from "vue/server-renderer";
import "./api-9xEAR-2s.js";
import { u as useGeeTestCaptcha } from "./useGeeTestCaptcha-DFKF46Gm.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
import "./admin-BhXx1q9A.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import { u as useHead } from "./v3-CVe3IQuN.js";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-slate-950 px-6 py-10 text-white" }, _attrs))}><div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><section class="space-y-8"><div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"><span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300"> 安 </span> 后台仅面向管理员开放 </div><div><h1 class="max-w-2xl text-5xl font-semibold leading-tight tracking-[-0.05em] text-white md:text-6xl"> 用更集中的后台入口，管理文章、评论、媒体与站点设置。 </h1><p class="mt-6 max-w-xl text-base leading-8 text-slate-300"> 登录后即可进入统一后台，内容发布、评论审核、Banner、SMTP 与存储配置都已经接入新的 Rust + PostgreSQL 后端。 </p></div><div class="grid gap-4 md:grid-cols-3"><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">统一入口</p><p class="mt-2 text-sm leading-7 text-slate-300">Nuxt 已接管后台路由，登录后可直接进入各管理模块。</p></div><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">新后端</p><p class="mt-2 text-sm leading-7 text-slate-300">后台接口已运行在 Rust + PostgreSQL 上，数据流不再依赖旧 Node API。</p></div><div class="rounded-[4px] border border-white/10 bg-white/5 p-5"><p class="text-sm font-semibold text-white">渐进迁移</p><p class="mt-2 text-sm leading-7 text-slate-300">原生 Nuxt 页面会逐步替换旧后台页面，不影响现有功能继续使用。</p></div></div></section><section class="admin-card mx-auto w-full max-w-xl p-8 text-slate-900"><div class="mb-8 flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-[4px] bg-blue-600 text-white"> 登 </div><div><p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Login</p><h2 class="mt-1 text-2xl font-semibold tracking-[-0.03em]">管理员登录</h2></div></div><form class="space-y-5"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">用户名</span><input${ssrRenderAttr("value", unref(username))} class="admin-input" autocomplete="username"></label><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">登录密码</span><input${ssrRenderAttr("value", unref(password))} class="admin-input" type="password" autocomplete="current-password"></label><label class="flex items-center gap-3 text-sm text-slate-600"><input${ssrIncludeBooleanAttr(Array.isArray(unref(remember)) ? ssrLooseContain(unref(remember), null) : unref(remember)) ? " checked" : ""} type="checkbox"> 记住当前设备 </label>`);
      if (unref(errorMessage)) {
        _push(`<p class="text-sm text-rose-600">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="admin-button-primary w-full"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""} type="submit">${ssrInterpolate(unref(submitting) ? "登录中..." : "进入管理后台")}</button></form><div class="mt-6 flex items-center justify-end text-sm text-slate-500">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        class: "font-medium text-blue-600",
        to: "/"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`返回博客前台`);
          } else {
            return [
              createTextVNode("返回博客前台")
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
export {
  _sfc_main as default
};
//# sourceMappingURL=login-CQ_QI4E7.js.map
