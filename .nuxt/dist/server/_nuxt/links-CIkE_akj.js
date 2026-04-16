import { _ as _sfc_main$1 } from "./PageHero-mei_8pXg.js";
import { defineComponent, withAsyncContext, reactive, ref, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr } from "vue/server-renderer";
import { _ as _sfc_main$2 } from "./AppImage-CpDcJIeD.js";
import { h as fetchPublicFooterLinks } from "./api-9xEAR-2s.js";
import { u as useGeeTestCaptcha } from "./useGeeTestCaptcha-DFKF46Gm.js";
import { u as useAsyncData } from "./asyncData-BA1__WkK.js";
import { a as useSeoMeta } from "./v3-CVe3IQuN.js";
import "marked";
import "./admin-editor-CUf6Pf5Q.js";
import "./api-base-COxdl8qP.js";
import "../server.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/hookable/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/unctx/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/h3/dist/index.mjs";
import "vue-router";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/defu/dist/defu.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/ufo/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "links",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: links } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("friend-links", fetchPublicFooterLinks)), __temp = await __temp, __restore(), __temp);
    const form = reactive({
      siteName: "",
      siteUrl: "",
      iconUrl: "",
      description: "",
      contactName: "",
      contactEmail: ""
    });
    const submitting = ref(false);
    const submitMessage = ref("");
    const captchaEnabled = ref(false);
    const captchaId = ref(null);
    function isExternal(href) {
      return /^https?:\/\//i.test(href);
    }
    useGeeTestCaptcha(
      captchaId
    );
    useSeoMeta({
      title: "Links",
      description: "Partner sites and a public link exchange form."
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_PageHero, {
        centered: "",
        eyebrow: "Links",
        title: "Partner sites",
        description: "Browse curated partner sites or submit your own site for review."
      }, null, _parent));
      _push(`<section class="mx-auto max-w-6xl px-6 pb-10"><div class="grid gap-4 md:grid-cols-2"><!--[-->`);
      ssrRenderList(unref(links) || [], (item) => {
        _push(`<a${ssrRenderAttr("href", item.href)}${ssrRenderAttr("target", isExternal(item.href) ? "_blank" : void 0)}${ssrRenderAttr("rel", isExternal(item.href) ? "noopener noreferrer" : void 0)} class="blog-panel flex items-center gap-4 border border-[var(--blog-border)] p-5 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]">`);
        if (item.iconUrl) {
          _push(ssrRenderComponent(_sfc_main$2, {
            src: item.iconUrl,
            alt: item.label,
            class: "h-14 w-14 shrink-0 rounded-2xl border border-[var(--blog-border)] object-cover"
          }, null, _parent));
        } else {
          _push(`<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] text-lg font-semibold text-[var(--blog-ink)]">${ssrInterpolate(item.label.slice(0, 1).toUpperCase())}</div>`);
        }
        _push(`<div class="min-w-0"><p class="text-base font-medium text-[var(--blog-ink)]">${ssrInterpolate(item.label)}</p><p class="mt-2 text-sm leading-7 text-[var(--blog-muted)]">${ssrInterpolate(item.description || "Curated partner site.")}</p></div></a>`);
      });
      _push(`<!--]--></div></section><section class="mx-auto max-w-6xl px-6 pb-20"><div class="blog-panel border border-[var(--blog-border)] p-6 sm:p-8"><h2 class="text-2xl font-semibold text-[var(--blog-ink)]">Submit your site</h2><p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]"> Share your site profile and contact information. Approved sites can be added to the public links list. </p><form class="mt-6 space-y-4"><div class="grid gap-4 md:grid-cols-2"><input${ssrRenderAttr("value", unref(form).siteName)} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Site name" required><input${ssrRenderAttr("value", unref(form).siteUrl)} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="https://example.com" type="url" required></div><div class="grid gap-4 md:grid-cols-2"><input${ssrRenderAttr("value", unref(form).iconUrl)} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Icon URL (optional)" type="url"><input${ssrRenderAttr("value", unref(form).contactName)} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Contact name" required></div><input${ssrRenderAttr("value", unref(form).contactEmail)} class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Contact email" type="email" required><textarea class="min-h-28 w-full rounded-3xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm leading-7 outline-none" placeholder="Describe your site in a few sentences." required>${ssrInterpolate(unref(form).description)}</textarea>`);
      if (unref(captchaEnabled)) {
        _push(`<p class="text-xs text-[var(--blog-muted)]"> GeeTest verification is required before this application can be submitted. </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex flex-wrap items-center gap-3"><button class="blog-button-primary" type="submit"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""}>${ssrInterpolate(unref(submitting) ? "Submitting..." : "Submit application")}</button>`);
      if (unref(submitMessage)) {
        _push(`<span class="text-sm text-[var(--blog-muted)]">${ssrInterpolate(unref(submitMessage))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form></div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/links.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=links-CIkE_akj.js.map
