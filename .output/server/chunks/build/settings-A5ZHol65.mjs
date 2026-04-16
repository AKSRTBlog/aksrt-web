import { _ as _sfc_main$1 } from './AdminPageHeader-7bRWSeA5.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-QV1LfQc6.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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

function useAdminSiteSettings() {
  const { adminApiFetch } = useAdminSession();
  const loading = ref(false);
  const saving = ref(false);
  const testingSmtp = ref(false);
  const error = ref("");
  const successMessage = ref("");
  const settings = ref(null);
  const captchaConfig = ref(null);
  const publicForm = ref({
    siteTitle: "",
    siteDescription: "",
    logoUrl: "",
    footerText: "",
    commentEnabled: true,
    seoKeywords: "",
    icpFiling: "",
    policeFiling: "",
    showFiling: false,
    githubUsername: ""
  });
  const customCodeForm = ref({
    customHeadCode: "",
    customFooterCode: ""
  });
  const storageForm = ref({
    enabled: true,
    driver: "local",
    endpoint: "",
    region: "",
    bucket: "",
    accessKeyId: "",
    secretAccessKey: "",
    publicBaseUrl: "",
    baseFolder: "blog",
    forcePathStyle: false
  });
  const smtpForm = ref({
    enabled: false,
    host: "",
    port: "587",
    secure: false,
    username: "",
    password: "",
    fromName: "",
    fromEmail: ""
  });
  const captchaForm = ref({
    enabled: false,
    captchaId: "",
    captchaKey: "",
    enabledOnComment: true,
    enabledOnFriendLink: true,
    enabledOnLogin: true
  });
  function clearFeedback() {
    error.value = "";
    successMessage.value = "";
  }
  function syncSmtpForm(smtp) {
    smtpForm.value = {
      enabled: smtp.enabled,
      host: smtp.host,
      port: String(smtp.port),
      secure: smtp.secure,
      username: smtp.username,
      password: "",
      fromName: smtp.fromName,
      fromEmail: smtp.fromEmail
    };
  }
  function buildSmtpPayload() {
    const body = {
      enabled: smtpForm.value.enabled,
      host: smtpForm.value.host.trim(),
      port: parseInt(smtpForm.value.port, 10),
      secure: smtpForm.value.secure,
      username: smtpForm.value.username.trim(),
      fromName: smtpForm.value.fromName.trim(),
      fromEmail: smtpForm.value.fromEmail.trim()
    };
    if (smtpForm.value.password.trim()) {
      body.password = smtpForm.value.password.trim();
    }
    return body;
  }
  async function persistSmtpConfig() {
    const result = await adminApiFetch("/api/v1/admin/smtp/config", {
      method: "PUT",
      body: JSON.stringify(buildSmtpPayload())
    });
    if (settings.value) {
      settings.value.smtpConfig = result;
    }
    syncSmtpForm(result);
    return result;
  }
  async function loadSettings() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    loading.value = true;
    error.value = "";
    try {
      const [siteResult, captchaResult] = await Promise.all([
        adminApiFetch("/api/v1/admin/site-settings"),
        adminApiFetch("/api/v1/admin/site-settings/captcha")
      ]);
      settings.value = siteResult;
      captchaConfig.value = captchaResult;
      const pub = siteResult.publicConfig;
      publicForm.value = {
        siteTitle: pub.siteTitle,
        siteDescription: pub.siteDescription,
        logoUrl: (_a = pub.logoUrl) != null ? _a : "",
        footerText: pub.footerText,
        commentEnabled: pub.commentEnabled,
        seoKeywords: pub.seo.keywords,
        icpFiling: (_b = pub.icpFiling) != null ? _b : "",
        policeFiling: (_c = pub.policeFiling) != null ? _c : "",
        showFiling: pub.showFiling,
        githubUsername: (_d = pub.githubUsername) != null ? _d : ""
      };
      customCodeForm.value = {
        customHeadCode: (_e = pub.customHeadCode) != null ? _e : "",
        customFooterCode: (_f = pub.customFooterCode) != null ? _f : ""
      };
      const sto = siteResult.storageConfig;
      storageForm.value = {
        enabled: sto.enabled,
        driver: sto.driver,
        endpoint: (_g = sto.endpoint) != null ? _g : "",
        region: (_h = sto.region) != null ? _h : "",
        bucket: (_i = sto.bucket) != null ? _i : "",
        accessKeyId: sto.accessKeyId,
        secretAccessKey: "",
        publicBaseUrl: sto.publicBaseUrl,
        baseFolder: sto.baseFolder,
        forcePathStyle: sto.forcePathStyle
      };
      syncSmtpForm(siteResult.smtpConfig);
      captchaForm.value = {
        enabled: captchaResult.enabled,
        captchaId: captchaResult.captchaId,
        captchaKey: "",
        enabledOnComment: captchaResult.enabledOnComment,
        enabledOnFriendLink: captchaResult.enabledOnFriendLink,
        enabledOnLogin: captchaResult.enabledOnLogin
      };
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u52A0\u8F7D\u8BBE\u7F6E\u5931\u8D25";
    } finally {
      loading.value = false;
    }
  }
  async function savePublicSettings() {
    saving.value = true;
    clearFeedback();
    try {
      const result = await adminApiFetch("/api/v1/admin/site-settings/public", {
        method: "PUT",
        body: JSON.stringify({
          siteTitle: publicForm.value.siteTitle.trim(),
          siteDescription: publicForm.value.siteDescription.trim(),
          logoUrl: publicForm.value.logoUrl.trim() || null,
          footerText: publicForm.value.footerText.trim(),
          commentEnabled: publicForm.value.commentEnabled,
          seoKeywords: publicForm.value.seoKeywords.trim(),
          icpFiling: publicForm.value.icpFiling.trim() || null,
          policeFiling: publicForm.value.policeFiling.trim() || null,
          showFiling: publicForm.value.showFiling,
          githubUsername: publicForm.value.githubUsername.trim() || null
        })
      });
      if (settings.value) {
        settings.value.publicConfig = result;
      }
      successMessage.value = "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25";
    } finally {
      saving.value = false;
    }
  }
  async function saveCustomCode() {
    saving.value = true;
    clearFeedback();
    try {
      const result = await adminApiFetch("/api/v1/admin/site-settings/public", {
        method: "PUT",
        body: JSON.stringify({
          customHeadCode: customCodeForm.value.customHeadCode,
          customFooterCode: customCodeForm.value.customFooterCode
        })
      });
      if (settings.value) {
        settings.value.publicConfig = result;
      }
      successMessage.value = "\u81EA\u5B9A\u4E49\u4EE3\u7801\u5DF2\u4FDD\u5B58";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25";
    } finally {
      saving.value = false;
    }
  }
  async function saveStorageSettings() {
    saving.value = true;
    clearFeedback();
    try {
      const body = {
        enabled: storageForm.value.enabled,
        driver: storageForm.value.driver,
        endpoint: storageForm.value.endpoint.trim() || null,
        region: storageForm.value.region.trim() || null,
        bucket: storageForm.value.bucket.trim() || null,
        accessKeyId: storageForm.value.accessKeyId.trim(),
        publicBaseUrl: storageForm.value.publicBaseUrl.trim(),
        baseFolder: storageForm.value.baseFolder.trim() || "blog",
        forcePathStyle: storageForm.value.forcePathStyle
      };
      if (storageForm.value.secretAccessKey.trim()) {
        body.secretAccessKey = storageForm.value.secretAccessKey.trim();
      }
      const result = await adminApiFetch("/api/v1/admin/site-settings/storage", {
        method: "PUT",
        body: JSON.stringify(body)
      });
      if (settings.value) {
        settings.value.storageConfig = result;
      }
      successMessage.value = "\u5B58\u50A8\u8BBE\u7F6E\u5DF2\u4FDD\u5B58";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25";
    } finally {
      saving.value = false;
    }
  }
  async function saveSmtpSettings() {
    saving.value = true;
    clearFeedback();
    try {
      await persistSmtpConfig();
      successMessage.value = "SMTP \u8BBE\u7F6E\u5DF2\u4FDD\u5B58";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25";
    } finally {
      saving.value = false;
    }
  }
  async function testSmtpSettings() {
    if (!smtpForm.value.enabled) {
      error.value = "\u8BF7\u5148\u542F\u7528 SMTP";
      successMessage.value = "";
      return;
    }
    testingSmtp.value = true;
    clearFeedback();
    try {
      const savedConfig = await persistSmtpConfig();
      await adminApiFetch("/api/v1/admin/smtp/test", {
        method: "POST",
        body: JSON.stringify({
          toEmail: savedConfig.fromEmail
        })
      });
      successMessage.value = `\u6D4B\u8BD5\u90AE\u4EF6\u5DF2\u53D1\u9001\u81F3 ${savedConfig.fromEmail}`;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u6D4B\u8BD5\u53D1\u9001\u5931\u8D25";
    } finally {
      testingSmtp.value = false;
    }
  }
  async function saveCaptchaSettings() {
    saving.value = true;
    clearFeedback();
    try {
      const body = {
        enabled: captchaForm.value.enabled,
        captchaId: captchaForm.value.captchaId.trim(),
        enabledOnComment: captchaForm.value.enabledOnComment,
        enabledOnFriendLink: captchaForm.value.enabledOnFriendLink,
        enabledOnLogin: captchaForm.value.enabledOnLogin
      };
      if (captchaForm.value.captchaKey.trim()) {
        body.captchaKey = captchaForm.value.captchaKey.trim();
      }
      const result = await adminApiFetch("/api/v1/admin/site-settings/captcha", {
        method: "PUT",
        body: JSON.stringify(body)
      });
      captchaConfig.value = result;
      captchaForm.value = {
        enabled: result.enabled,
        captchaId: result.captchaId,
        captchaKey: "",
        enabledOnComment: result.enabledOnComment,
        enabledOnFriendLink: result.enabledOnFriendLink,
        enabledOnLogin: result.enabledOnLogin
      };
      successMessage.value = "\u9A8C\u8BC1\u7801\u8BBE\u7F6E\u5DF2\u4FDD\u5B58";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "\u4FDD\u5B58\u5931\u8D25";
    } finally {
      saving.value = false;
    }
  }
  return {
    loading,
    saving,
    testingSmtp,
    error,
    successMessage,
    settings,
    captchaConfig,
    publicForm,
    customCodeForm,
    storageForm,
    smtpForm,
    captchaForm,
    loadSettings,
    savePublicSettings,
    saveCustomCode,
    saveStorageSettings,
    saveSmtpSettings,
    testSmtpSettings,
    saveCaptchaSettings
  };
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "\u7AD9\u70B9\u8BBE\u7F6E"
    });
    const {
      loading,
      saving,
      testingSmtp,
      error,
      successMessage,
      publicForm,
      customCodeForm,
      storageForm,
      smtpForm,
      captchaConfig,
      captchaForm
    } = useAdminSiteSettings();
    useAdminSession();
    const activeTab = ref("general");
    const captchaDebugArticleSlug = ref("article-1");
    const captchaDebugMessage = ref("");
    const captchaDebugResult = ref(null);
    const captchaDebugPayload = ref(null);
    const runningCaptchaDebug = ref(false);
    const savedCommentCaptchaId = computed(() => {
      var _a;
      if (!((_a = captchaConfig.value) == null ? void 0 : _a.enabled) || !captchaConfig.value.enabledOnComment) {
        return null;
      }
      const value = captchaConfig.value.captchaId.trim();
      return value || null;
    });
    const tabs = [
      { id: "general", label: "\u5E38\u89C4" },
      { id: "customCode", label: "\u81EA\u5B9A\u4E49\u4EE3\u7801" },
      { id: "storage", label: "\u5B58\u50A8" },
      { id: "smtp", label: "SMTP" },
      { id: "security", label: "\u5B89\u5168" }
    ];
    const { loaded: captchaDebugLoaded } = useGeeTestCaptcha(
      savedCommentCaptchaId
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u7AD9\u70B9\u8BBE\u7F6E",
        description: "\u914D\u7F6E\u7AD9\u70B9\u7684\u57FA\u672C\u4FE1\u606F\u3001\u5B58\u50A8\u3001SMTP \u7B49\u8BBE\u7F6E\u3002"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: "/admin"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u8FD4\u56DE\u63A7\u5236\u53F0`);
                } else {
                  return [
                    createTextVNode("\u8FD4\u56DE\u63A7\u5236\u53F0")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_NuxtLink, {
                class: "admin-button-secondary",
                to: "/admin"
              }, {
                default: withCtx(() => [
                  createTextVNode("\u8FD4\u56DE\u63A7\u5236\u53F0")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="admin-card border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(successMessage)) {
        _push(`<div class="admin-card border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">${ssrInterpolate(unref(successMessage))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="admin-card px-5 py-10 text-center text-sm text-slate-500"> \u6B63\u5728\u52A0\u8F7D\u8BBE\u7F6E... </div>`);
      } else {
        _push(`<!--[--><div class="admin-card p-1"><nav class="flex gap-1"><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([{ "admin-tab-active": unref(activeTab) === tab.id }, "admin-tab-button"])}">${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--></nav></div>`);
        if (unref(activeTab) === "general") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">\u5E38\u89C4\u8BBE\u7F6E</h3><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">\u7AD9\u70B9\u6807\u9898</label><input${ssrRenderAttr("value", unref(publicForm).siteTitle)} class="admin-input" placeholder="\u8F93\u5165\u7AD9\u70B9\u6807\u9898"></div><div><label class="admin-label">\u7AD9\u70B9\u63CF\u8FF0</label><input${ssrRenderAttr("value", unref(publicForm).siteDescription)} class="admin-input" placeholder="\u8F93\u5165\u7AD9\u70B9\u63CF\u8FF0"></div><div class="lg:col-span-2"><label class="admin-label">Logo URL</label><input${ssrRenderAttr("value", unref(publicForm).logoUrl)} class="admin-input" placeholder="https://example.com/logo.png"></div><div class="lg:col-span-2"><label class="admin-label">\u5E95\u90E8\u6587\u5B57</label><input${ssrRenderAttr("value", unref(publicForm).footerText)} class="admin-input" placeholder="Powered by AKSRT Blog"></div><div class="lg:col-span-2"><label class="admin-label">SEO \u5173\u952E\u8BCD</label><input${ssrRenderAttr("value", unref(publicForm).seoKeywords)} class="admin-input" placeholder="keyword1, keyword2, keyword3"></div><div class="lg:col-span-2"><label class="admin-label">GitHub \u7528\u6237\u540D</label><input${ssrRenderAttr("value", unref(publicForm).githubUsername)} class="admin-input" placeholder="your-github-username"></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(publicForm).commentEnabled) ? ssrLooseContain(unref(publicForm).commentEnabled, null) : unref(publicForm).commentEnabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528\u8BC4\u8BBA\u529F\u80FD</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(publicForm).showFiling) ? ssrLooseContain(unref(publicForm).showFiling, null) : unref(publicForm).showFiling) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u663E\u793A\u5907\u6848\u4FE1\u606F</span></label></div><div><label class="admin-label">ICP \u5907\u6848\u53F7</label><input${ssrRenderAttr("value", unref(publicForm).icpFiling)} class="admin-input" placeholder="\u4EACICP\u5907xxxxxxx\u53F7"></div><div><label class="admin-label">\u516C\u5B89\u8054\u7F51\u5907\u6848\u53F7</label><input${ssrRenderAttr("value", unref(publicForm).policeFiling)} class="admin-input" placeholder="xxxx-xxxx"></div></div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u8BBE\u7F6E")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "customCode") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">\u81EA\u5B9A\u4E49\u4EE3\u7801</h3><div class="space-y-6"><div><label class="admin-label">Head \u4EE3\u7801\uFF08\u4F1A\u63D2\u5165\u5230 &lt;head&gt; \u6807\u7B7E\u5185\uFF09</label><textarea class="admin-textarea min-h-40 font-mono text-sm" placeholder="&lt;!-- \u63D2\u5165\u81EA\u5B9A\u4E49\u4EE3\u7801 --&gt;">${ssrInterpolate(unref(customCodeForm).customHeadCode)}</textarea></div><div><label class="admin-label">Footer \u4EE3\u7801\uFF08\u4F1A\u63D2\u5165\u5230\u9875\u9762\u5E95\u90E8\uFF09</label><textarea class="admin-textarea min-h-40 font-mono text-sm" placeholder="&lt;!-- \u63D2\u5165\u81EA\u5B9A\u4E49\u4EE3\u7801 --&gt;">${ssrInterpolate(unref(customCodeForm).customFooterCode)}</textarea></div></div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u4EE3\u7801")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "storage") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">\u5B58\u50A8\u8BBE\u7F6E</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).enabled) ? ssrLooseContain(unref(storageForm).enabled, null) : unref(storageForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528\u5916\u90E8\u5B58\u50A8</span></label></div><div><label class="admin-label">\u5B58\u50A8\u9A71\u52A8</label><select class="admin-select"><option value="local"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "local") : ssrLooseEqual(unref(storageForm).driver, "local")) ? " selected" : ""}>\u672C\u5730\u5B58\u50A8</option><option value="aliyun-oss"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "aliyun-oss") : ssrLooseEqual(unref(storageForm).driver, "aliyun-oss")) ? " selected" : ""}>\u963F\u91CC\u4E91 OSS</option><option value="tencent-cos"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "tencent-cos") : ssrLooseEqual(unref(storageForm).driver, "tencent-cos")) ? " selected" : ""}>\u817E\u8BAF\u4E91 COS</option><option value="s3-compatible"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "s3-compatible") : ssrLooseEqual(unref(storageForm).driver, "s3-compatible")) ? " selected" : ""}>S3 \u517C\u5BB9\u5B58\u50A8</option></select></div>`);
          if (unref(storageForm).driver !== "local") {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">Endpoint</label><input${ssrRenderAttr("value", unref(storageForm).endpoint)} class="admin-input" placeholder="https://oss-cn-hangzhou.aliyuncs.com"></div><div><label class="admin-label">\u5730\u57DF</label><input${ssrRenderAttr("value", unref(storageForm).region)} class="admin-input" placeholder="oss-cn-hangzhou"></div><div><label class="admin-label">Bucket</label><input${ssrRenderAttr("value", unref(storageForm).bucket)} class="admin-input" placeholder="my-blog-bucket"></div><div><label class="admin-label">Access Key ID</label><input${ssrRenderAttr("value", unref(storageForm).accessKeyId)} class="admin-input" placeholder="your-access-key-id"></div><div><label class="admin-label">Secret Access Key</label><input${ssrRenderAttr("value", unref(storageForm).secretAccessKey)} type="password" class="admin-input" placeholder="\u7559\u7A7A\u5219\u4E0D\u66F4\u65B0"></div><div><label class="admin-label">\u516C\u5171\u57FA\u7840 URL</label><input${ssrRenderAttr("value", unref(storageForm).publicBaseUrl)} class="admin-input" placeholder="https://your-cdn.example.com"></div><div><label class="admin-label">\u57FA\u7840\u76EE\u5F55</label><input${ssrRenderAttr("value", unref(storageForm).baseFolder)} class="admin-input" placeholder="blog"></div><div><label class="admin-checkbox-label mt-8"><input${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).forcePathStyle) ? ssrLooseContain(unref(storageForm).forcePathStyle, null) : unref(storageForm).forcePathStyle) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u5F3A\u5236 Path Style</span></label></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u5B58\u50A8\u8BBE\u7F6E")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "smtp") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">SMTP \u90AE\u4EF6\u8BBE\u7F6E</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(smtpForm).enabled) ? ssrLooseContain(unref(smtpForm).enabled, null) : unref(smtpForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528 SMTP \u53D1\u9001\u90AE\u4EF6</span></label></div>`);
          if (unref(smtpForm).enabled) {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">SMTP \u670D\u52A1\u5668</label><input${ssrRenderAttr("value", unref(smtpForm).host)} class="admin-input" placeholder="smtp.example.com"></div><div><label class="admin-label">\u7AEF\u53E3</label><input${ssrRenderAttr("value", unref(smtpForm).port)} type="number" class="admin-input" placeholder="587"></div><div><label class="admin-checkbox-label mt-8"><input${ssrIncludeBooleanAttr(Array.isArray(unref(smtpForm).secure) ? ssrLooseContain(unref(smtpForm).secure, null) : unref(smtpForm).secure) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u4F7F\u7528 SSL/TLS</span></label></div><div><label class="admin-label">\u7528\u6237\u540D</label><input${ssrRenderAttr("value", unref(smtpForm).username)} class="admin-input" placeholder="your@email.com"></div><div><label class="admin-label">\u5BC6\u7801</label><input${ssrRenderAttr("value", unref(smtpForm).password)} type="password" class="admin-input" placeholder="\u7559\u7A7A\u5219\u4E0D\u66F4\u65B0"></div><div><label class="admin-label">\u53D1\u4EF6\u4EBA\u540D\u79F0</label><input${ssrRenderAttr("value", unref(smtpForm).fromName)} class="admin-input" placeholder="AKSRT Blog"></div><div><label class="admin-label">\u53D1\u4EF6\u4EBA\u90AE\u7BB1</label><input${ssrRenderAttr("value", unref(smtpForm).fromEmail)} type="email" class="admin-input" placeholder="noreply@example.com"></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end gap-3"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(saving) || unref(testingSmtp) || !unref(smtpForm).enabled) ? " disabled" : ""}>${ssrInterpolate(unref(testingSmtp) ? "\u6D4B\u8BD5\u53D1\u9001\u4E2D..." : "\u6D4B\u8BD5\u53D1\u9001")}</button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving) || unref(testingSmtp)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58 SMTP \u8BBE\u7F6E")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "security") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">\u5B89\u5168\u8BBE\u7F6E - \u6781\u9A8C\u9A8C\u8BC1\u7801</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabled) ? ssrLooseContain(unref(captchaForm).enabled, null) : unref(captchaForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u542F\u7528\u6781\u9A8C\u9A8C\u8BC1\u7801</span></label></div>`);
          if (unref(captchaForm).enabled) {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">Captcha ID</label><input${ssrRenderAttr("value", unref(captchaForm).captchaId)} class="admin-input" placeholder="your-captcha-id"></div><div><label class="admin-label">Captcha Key</label><input${ssrRenderAttr("value", unref(captchaForm).captchaKey)} type="password" class="admin-input" placeholder="\u7559\u7A7A\u5219\u4E0D\u66F4\u65B0"></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnLogin) ? ssrLooseContain(unref(captchaForm).enabledOnLogin, null) : unref(captchaForm).enabledOnLogin) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u767B\u5F55\u65F6\u542F\u7528\u9A8C\u8BC1\u7801</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnComment) ? ssrLooseContain(unref(captchaForm).enabledOnComment, null) : unref(captchaForm).enabledOnComment) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u8BC4\u8BBA\u65F6\u542F\u7528\u9A8C\u8BC1\u7801</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnFriendLink) ? ssrLooseContain(unref(captchaForm).enabledOnFriendLink, null) : unref(captchaForm).enabledOnFriendLink) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>\u7533\u8BF7\u53CB\u94FE\u65F6\u542F\u7528\u9A8C\u8BC1\u7801</span></label></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u4FDD\u5B58\u4E2D..." : "\u4FDD\u5B58\u5B89\u5168\u8BBE\u7F6E")}</button></div><div class="mt-8 rounded-[4px] border border-dashed border-slate-300 bg-slate-50 p-5"><div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h4 class="text-base font-semibold text-slate-900">Comment Captcha Debug</h4><p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500"> This temporary tool opens GeeTest with the saved comment-scene config, then sends the callback payload to an admin dry-run endpoint. It validates the same comment captcha path without writing a real comment to the database. </p></div><p class="text-xs text-slate-500"> Saved config only. Save the security settings first after changing captcha ID or key. </p></div><div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">Article slug</span><input${ssrRenderAttr("value", unref(captchaDebugArticleSlug))} class="admin-input" placeholder="article-1"></label><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(saving) || unref(runningCaptchaDebug)) ? " disabled" : ""}>${ssrInterpolate(unref(runningCaptchaDebug) ? "Running debug..." : "Run comment captcha debug")}</button></div><div class="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4"><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Captcha enabled:</span> ${ssrInterpolate(((_a = unref(captchaConfig)) == null ? void 0 : _a.enabled) ? "yes" : "no")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Comment scene:</span> ${ssrInterpolate(((_b = unref(captchaConfig)) == null ? void 0 : _b.enabledOnComment) ? "enabled" : "disabled")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Captcha key:</span> ${ssrInterpolate(((_c = unref(captchaConfig)) == null ? void 0 : _c.captchaKeyConfigured) ? "saved" : "missing")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Widget loader:</span> ${ssrInterpolate(unref(captchaDebugLoaded) ? "ready" : "loading")}</div></div>`);
          if (unref(captchaDebugMessage)) {
            _push(`<p class="${ssrRenderClass([((_d = unref(captchaDebugResult)) == null ? void 0 : _d.commentWouldBeAccepted) ? "text-emerald-600" : "text-rose-600", "mt-4 text-sm"])}">${ssrInterpolate(unref(captchaDebugMessage))}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="mt-4 grid gap-4 xl:grid-cols-2"><div><p class="text-sm font-semibold text-slate-800">Client callback payload</p><pre class="mt-2 overflow-x-auto rounded-[4px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">${ssrInterpolate(unref(captchaDebugPayload) ? JSON.stringify(unref(captchaDebugPayload), null, 2) : "Run the debug flow to inspect the GeeTest callback payload.")}</pre></div><div><p class="text-sm font-semibold text-slate-800">Backend dry-run result</p><pre class="mt-2 overflow-x-auto rounded-[4px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">${ssrInterpolate(unref(captchaDebugResult) ? JSON.stringify(unref(captchaDebugResult), null, 2) : "No backend dry-run has been executed yet.")}</pre></div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-A5ZHol65.mjs.map
