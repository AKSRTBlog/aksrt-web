import { _ as _sfc_main$1 } from "./AdminPageHeader-7bRWSeA5.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-QV1LfQc6.js";
import { ref, defineComponent, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import { u as useGeeTestCaptcha } from "./useGeeTestCaptcha-DFKF46Gm.js";
import { u as useAdminSession } from "./useAdminSession-fnHBOwsd.js";
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
import "./api-base-COxdl8qP.js";
import "C:/Users/kate5/Desktop/aksrtblog/frontend/node_modules/@unhead/vue/dist/index.mjs";
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
        logoUrl: pub.logoUrl ?? "",
        footerText: pub.footerText,
        commentEnabled: pub.commentEnabled,
        seoKeywords: pub.seo.keywords,
        icpFiling: pub.icpFiling ?? "",
        policeFiling: pub.policeFiling ?? "",
        showFiling: pub.showFiling,
        githubUsername: pub.githubUsername ?? ""
      };
      customCodeForm.value = {
        customHeadCode: pub.customHeadCode ?? "",
        customFooterCode: pub.customFooterCode ?? ""
      };
      const sto = siteResult.storageConfig;
      storageForm.value = {
        enabled: sto.enabled,
        driver: sto.driver,
        endpoint: sto.endpoint ?? "",
        region: sto.region ?? "",
        bucket: sto.bucket ?? "",
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
      error.value = e instanceof Error ? e.message : "加载设置失败";
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
      successMessage.value = "设置已保存";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
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
      successMessage.value = "自定义代码已保存";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
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
      successMessage.value = "存储设置已保存";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
    } finally {
      saving.value = false;
    }
  }
  async function saveSmtpSettings() {
    saving.value = true;
    clearFeedback();
    try {
      await persistSmtpConfig();
      successMessage.value = "SMTP 设置已保存";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
    } finally {
      saving.value = false;
    }
  }
  async function testSmtpSettings() {
    if (!smtpForm.value.enabled) {
      error.value = "请先启用 SMTP";
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
      successMessage.value = `测试邮件已发送至 ${savedConfig.fromEmail}`;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "测试发送失败";
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
      successMessage.value = "验证码设置已保存";
    } catch (e) {
      error.value = e instanceof Error ? e.message : "保存失败";
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
      title: "站点设置"
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
      if (!captchaConfig.value?.enabled || !captchaConfig.value.enabledOnComment) {
        return null;
      }
      const value = captchaConfig.value.captchaId.trim();
      return value || null;
    });
    const tabs = [
      { id: "general", label: "常规" },
      { id: "customCode", label: "自定义代码" },
      { id: "storage", label: "存储" },
      { id: "smtp", label: "SMTP" },
      { id: "security", label: "安全" }
    ];
    const { loaded: captchaDebugLoaded } = useGeeTestCaptcha(
      savedCommentCaptchaId
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "站点设置",
        description: "配置站点的基本信息、存储、SMTP 等设置。"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_NuxtLink, {
              class: "admin-button-secondary",
              to: "/admin"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`返回控制台`);
                } else {
                  return [
                    createTextVNode("返回控制台")
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
                  createTextVNode("返回控制台")
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
        _push(`<div class="admin-card px-5 py-10 text-center text-sm text-slate-500"> 正在加载设置... </div>`);
      } else {
        _push(`<!--[--><div class="admin-card p-1"><nav class="flex gap-1"><!--[-->`);
        ssrRenderList(tabs, (tab) => {
          _push(`<button class="${ssrRenderClass([{ "admin-tab-active": unref(activeTab) === tab.id }, "admin-tab-button"])}">${ssrInterpolate(tab.label)}</button>`);
        });
        _push(`<!--]--></nav></div>`);
        if (unref(activeTab) === "general") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">常规设置</h3><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">站点标题</label><input${ssrRenderAttr("value", unref(publicForm).siteTitle)} class="admin-input" placeholder="输入站点标题"></div><div><label class="admin-label">站点描述</label><input${ssrRenderAttr("value", unref(publicForm).siteDescription)} class="admin-input" placeholder="输入站点描述"></div><div class="lg:col-span-2"><label class="admin-label">Logo URL</label><input${ssrRenderAttr("value", unref(publicForm).logoUrl)} class="admin-input" placeholder="https://example.com/logo.png"></div><div class="lg:col-span-2"><label class="admin-label">底部文字</label><input${ssrRenderAttr("value", unref(publicForm).footerText)} class="admin-input" placeholder="Powered by AKSRT Blog"></div><div class="lg:col-span-2"><label class="admin-label">SEO 关键词</label><input${ssrRenderAttr("value", unref(publicForm).seoKeywords)} class="admin-input" placeholder="keyword1, keyword2, keyword3"></div><div class="lg:col-span-2"><label class="admin-label">GitHub 用户名</label><input${ssrRenderAttr("value", unref(publicForm).githubUsername)} class="admin-input" placeholder="your-github-username"></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(publicForm).commentEnabled) ? ssrLooseContain(unref(publicForm).commentEnabled, null) : unref(publicForm).commentEnabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>启用评论功能</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(publicForm).showFiling) ? ssrLooseContain(unref(publicForm).showFiling, null) : unref(publicForm).showFiling) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>显示备案信息</span></label></div><div><label class="admin-label">ICP 备案号</label><input${ssrRenderAttr("value", unref(publicForm).icpFiling)} class="admin-input" placeholder="京ICP备xxxxxxx号"></div><div><label class="admin-label">公安联网备案号</label><input${ssrRenderAttr("value", unref(publicForm).policeFiling)} class="admin-input" placeholder="xxxx-xxxx"></div></div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存设置")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "customCode") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">自定义代码</h3><div class="space-y-6"><div><label class="admin-label">Head 代码（会插入到 &lt;head&gt; 标签内）</label><textarea class="admin-textarea min-h-40 font-mono text-sm" placeholder="&lt;!-- 插入自定义代码 --&gt;">${ssrInterpolate(unref(customCodeForm).customHeadCode)}</textarea></div><div><label class="admin-label">Footer 代码（会插入到页面底部）</label><textarea class="admin-textarea min-h-40 font-mono text-sm" placeholder="&lt;!-- 插入自定义代码 --&gt;">${ssrInterpolate(unref(customCodeForm).customFooterCode)}</textarea></div></div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存代码")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "storage") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">存储设置</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).enabled) ? ssrLooseContain(unref(storageForm).enabled, null) : unref(storageForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>启用外部存储</span></label></div><div><label class="admin-label">存储驱动</label><select class="admin-select"><option value="local"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "local") : ssrLooseEqual(unref(storageForm).driver, "local")) ? " selected" : ""}>本地存储</option><option value="aliyun-oss"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "aliyun-oss") : ssrLooseEqual(unref(storageForm).driver, "aliyun-oss")) ? " selected" : ""}>阿里云 OSS</option><option value="tencent-cos"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "tencent-cos") : ssrLooseEqual(unref(storageForm).driver, "tencent-cos")) ? " selected" : ""}>腾讯云 COS</option><option value="s3-compatible"${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).driver) ? ssrLooseContain(unref(storageForm).driver, "s3-compatible") : ssrLooseEqual(unref(storageForm).driver, "s3-compatible")) ? " selected" : ""}>S3 兼容存储</option></select></div>`);
          if (unref(storageForm).driver !== "local") {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">Endpoint</label><input${ssrRenderAttr("value", unref(storageForm).endpoint)} class="admin-input" placeholder="https://oss-cn-hangzhou.aliyuncs.com"></div><div><label class="admin-label">地域</label><input${ssrRenderAttr("value", unref(storageForm).region)} class="admin-input" placeholder="oss-cn-hangzhou"></div><div><label class="admin-label">Bucket</label><input${ssrRenderAttr("value", unref(storageForm).bucket)} class="admin-input" placeholder="my-blog-bucket"></div><div><label class="admin-label">Access Key ID</label><input${ssrRenderAttr("value", unref(storageForm).accessKeyId)} class="admin-input" placeholder="your-access-key-id"></div><div><label class="admin-label">Secret Access Key</label><input${ssrRenderAttr("value", unref(storageForm).secretAccessKey)} type="password" class="admin-input" placeholder="留空则不更新"></div><div><label class="admin-label">公共基础 URL</label><input${ssrRenderAttr("value", unref(storageForm).publicBaseUrl)} class="admin-input" placeholder="https://your-cdn.example.com"></div><div><label class="admin-label">基础目录</label><input${ssrRenderAttr("value", unref(storageForm).baseFolder)} class="admin-input" placeholder="blog"></div><div><label class="admin-checkbox-label mt-8"><input${ssrIncludeBooleanAttr(Array.isArray(unref(storageForm).forcePathStyle) ? ssrLooseContain(unref(storageForm).forcePathStyle, null) : unref(storageForm).forcePathStyle) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>强制 Path Style</span></label></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存存储设置")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "smtp") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">SMTP 邮件设置</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(smtpForm).enabled) ? ssrLooseContain(unref(smtpForm).enabled, null) : unref(smtpForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>启用 SMTP 发送邮件</span></label></div>`);
          if (unref(smtpForm).enabled) {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">SMTP 服务器</label><input${ssrRenderAttr("value", unref(smtpForm).host)} class="admin-input" placeholder="smtp.example.com"></div><div><label class="admin-label">端口</label><input${ssrRenderAttr("value", unref(smtpForm).port)} type="number" class="admin-input" placeholder="587"></div><div><label class="admin-checkbox-label mt-8"><input${ssrIncludeBooleanAttr(Array.isArray(unref(smtpForm).secure) ? ssrLooseContain(unref(smtpForm).secure, null) : unref(smtpForm).secure) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>使用 SSL/TLS</span></label></div><div><label class="admin-label">用户名</label><input${ssrRenderAttr("value", unref(smtpForm).username)} class="admin-input" placeholder="your@email.com"></div><div><label class="admin-label">密码</label><input${ssrRenderAttr("value", unref(smtpForm).password)} type="password" class="admin-input" placeholder="留空则不更新"></div><div><label class="admin-label">发件人名称</label><input${ssrRenderAttr("value", unref(smtpForm).fromName)} class="admin-input" placeholder="AKSRT Blog"></div><div><label class="admin-label">发件人邮箱</label><input${ssrRenderAttr("value", unref(smtpForm).fromEmail)} type="email" class="admin-input" placeholder="noreply@example.com"></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end gap-3"><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(saving) || unref(testingSmtp) || !unref(smtpForm).enabled) ? " disabled" : ""}>${ssrInterpolate(unref(testingSmtp) ? "测试发送中..." : "测试发送")}</button><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving) || unref(testingSmtp)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存 SMTP 设置")}</button></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(activeTab) === "security") {
          _push(`<div class="admin-card p-6"><h3 class="mb-6 text-lg font-semibold text-slate-900">安全设置 - 极验验证码</h3><div class="space-y-6"><div><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabled) ? ssrLooseContain(unref(captchaForm).enabled, null) : unref(captchaForm).enabled) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>启用极验验证码</span></label></div>`);
          if (unref(captchaForm).enabled) {
            _push(`<div><div class="grid gap-6 lg:grid-cols-2"><div><label class="admin-label">Captcha ID</label><input${ssrRenderAttr("value", unref(captchaForm).captchaId)} class="admin-input" placeholder="your-captcha-id"></div><div><label class="admin-label">Captcha Key</label><input${ssrRenderAttr("value", unref(captchaForm).captchaKey)} type="password" class="admin-input" placeholder="留空则不更新"></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnLogin) ? ssrLooseContain(unref(captchaForm).enabledOnLogin, null) : unref(captchaForm).enabledOnLogin) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>登录时启用验证码</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnComment) ? ssrLooseContain(unref(captchaForm).enabledOnComment, null) : unref(captchaForm).enabledOnComment) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>评论时启用验证码</span></label></div><div class="lg:col-span-2"><label class="admin-checkbox-label"><input${ssrIncludeBooleanAttr(Array.isArray(unref(captchaForm).enabledOnFriendLink) ? ssrLooseContain(unref(captchaForm).enabledOnFriendLink, null) : unref(captchaForm).enabledOnFriendLink) ? " checked" : ""} type="checkbox" class="admin-checkbox"><span>申请友链时启用验证码</span></label></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-6 flex justify-end"><button class="admin-button-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "保存中..." : "保存安全设置")}</button></div><div class="mt-8 rounded-[4px] border border-dashed border-slate-300 bg-slate-50 p-5"><div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><h4 class="text-base font-semibold text-slate-900">Comment Captcha Debug</h4><p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500"> This temporary tool opens GeeTest with the saved comment-scene config, then sends the callback payload to an admin dry-run endpoint. It validates the same comment captcha path without writing a real comment to the database. </p></div><p class="text-xs text-slate-500"> Saved config only. Save the security settings first after changing captcha ID or key. </p></div><div class="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"><label class="block"><span class="mb-2 block text-sm font-medium text-slate-700">Article slug</span><input${ssrRenderAttr("value", unref(captchaDebugArticleSlug))} class="admin-input" placeholder="article-1"></label><button class="admin-button-secondary"${ssrIncludeBooleanAttr(unref(saving) || unref(runningCaptchaDebug)) ? " disabled" : ""}>${ssrInterpolate(unref(runningCaptchaDebug) ? "Running debug..." : "Run comment captcha debug")}</button></div><div class="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-2 xl:grid-cols-4"><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Captcha enabled:</span> ${ssrInterpolate(unref(captchaConfig)?.enabled ? "yes" : "no")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Comment scene:</span> ${ssrInterpolate(unref(captchaConfig)?.enabledOnComment ? "enabled" : "disabled")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Captcha key:</span> ${ssrInterpolate(unref(captchaConfig)?.captchaKeyConfigured ? "saved" : "missing")}</div><div class="rounded-[4px] bg-white px-3 py-2"><span class="font-semibold text-slate-700">Widget loader:</span> ${ssrInterpolate(unref(captchaDebugLoaded) ? "ready" : "loading")}</div></div>`);
          if (unref(captchaDebugMessage)) {
            _push(`<p class="${ssrRenderClass([unref(captchaDebugResult)?.commentWouldBeAccepted ? "text-emerald-600" : "text-rose-600", "mt-4 text-sm"])}">${ssrInterpolate(unref(captchaDebugMessage))}</p>`);
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
export {
  _sfc_main as default
};
//# sourceMappingURL=settings-A5ZHol65.js.map
