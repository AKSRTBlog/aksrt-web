import { _ as _sfc_main$4 } from "./PageHero-mei_8pXg.js";
import { defineComponent, mergeProps, useSSRContext, withAsyncContext, computed, unref } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrRenderComponent } from "vue/server-renderer";
import { _ as _sfc_main$3 } from "./AppImage-CpDcJIeD.js";
import { b as blogAuthor, f as fetchPublicSiteSettings, a as fetchActivityStats, c as fetchPublicProjects } from "./api-9xEAR-2s.js";
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
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "ActivityContributionGraph",
  __ssrInlineRender: true,
  props: {
    data: {}
  },
  setup(__props) {
    const colorLevels = [
      "bg-[#ebedf0]",
      "bg-[#9be9a8]",
      "bg-[#40c463]",
      "bg-[#30a14e]",
      "bg-[#216e39]"
    ];
    function getContributionLevel(count) {
      if (count === 0) return 0;
      if (count <= 2) return 1;
      if (count <= 5) return 2;
      if (count <= 8) return 3;
      return 4;
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.data) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "blog-panel p-6" }, _attrs))}><div class="mb-4 flex items-center justify-between"><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Activity</p><p class="text-xs text-[var(--blog-subtle)]">Past year: ${ssrInterpolate(__props.data.totalContributions)} contributions</p></div><div class="overflow-x-auto"><div class="flex gap-[3px]" style="${ssrRenderStyle({ "min-width": "680px" })}"><!--[-->`);
        ssrRenderList(__props.data.weeks, (week, weekIndex) => {
          _push(`<div class="flex flex-col gap-[3px]"><!--[-->`);
          ssrRenderList(week.contributionDays, (day, dayIndex) => {
            _push(`<div class="${ssrRenderClass(`h-[10px] w-[10px] rounded-sm ${colorLevels[getContributionLevel(day.contributionCount)]}`)}"${ssrRenderAttr("title", `${day.date}: ${day.contributionCount}`)}></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ActivityContributionGraph.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProjectGrid",
  __ssrInlineRender: true,
  props: {
    projects: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.projects.length > 0) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "blog-panel p-6" }, _attrs))}><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Projects</p><div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
        ssrRenderList(__props.projects, (project) => {
          _push(`<a${ssrRenderAttr("href", project.link)} target="_blank" rel="noopener noreferrer" class="group flex items-start gap-4 rounded-lg border border-[var(--blog-border)] p-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"><div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--blog-soft)] text-[var(--blog-accent)]">`);
          if (project.icon) {
            _push(ssrRenderComponent(_sfc_main$3, {
              src: project.icon,
              alt: project.title,
              class: "h-8 w-8 rounded object-cover"
            }, null, _parent));
          } else {
            _push(`<span class="text-lg font-semibold">P</span>`);
          }
          _push(`</div><div class="min-w-0 flex-1"><h3 class="text-sm font-semibold text-[var(--blog-ink)] group-hover:text-[var(--blog-accent)]">${ssrInterpolate(project.title)}</h3><p class="mt-1 line-clamp-2 text-xs leading-5 text-[var(--blog-muted)]">${ssrInterpolate(project.description)}</p></div></a>`);
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProjectGrid.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "about",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data: siteSettings } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("site-settings", fetchPublicSiteSettings)), __temp = await __temp, __restore(), __temp);
    const [{ data: activity }, { data: projects }] = ([__temp, __restore] = withAsyncContext(() => Promise.all([
      useAsyncData("about-activity", fetchActivityStats),
      useAsyncData("about-projects", fetchPublicProjects)
    ])), __temp = await __temp, __restore(), __temp);
    const contactLinks = computed(() => {
      const githubUsername = siteSettings.value?.githubUsername;
      return [
        { label: "Email", value: "kate522@88.com", href: "mailto:kate522@88.com" },
        {
          label: "GitHub",
          value: githubUsername ? `github.com/${githubUsername}` : "github.com/Lexo0522",
          href: githubUsername ? `https://github.com/${githubUsername}` : "https://github.com/Lexo0522"
        },
        { label: "QQ", value: "850024520", href: "https://wpa.qq.com/msgrd?v=3&uin=850024520&site=qq&menu=yes" }
      ];
    });
    useSeoMeta({
      title: "About",
      description: () => siteSettings.value?.siteDescription || blogAuthor.bio
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PageHero = _sfc_main$4;
      const _component_ActivityContributionGraph = _sfc_main$2;
      const _component_ProjectGrid = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}>`);
      _push(ssrRenderComponent(_component_PageHero, {
        centered: "",
        eyebrow: "About",
        title: "Profile and current work",
        description: "A quick overview of the author, contact channels, project work, and recent activity."
      }, null, _parent));
      _push(`<section class="mx-auto max-w-6xl px-6 pb-20"><div class="space-y-8"><div class="blog-panel p-8"><div class="flex flex-col gap-6 md:flex-row md:items-start">`);
      _push(ssrRenderComponent(_sfc_main$3, {
        class: "h-24 w-24 rounded-3xl object-cover",
        src: unref(blogAuthor).avatar,
        alt: unref(blogAuthor).name,
        loading: "eager"
      }, null, _parent));
      _push(`<div><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">About me</p><h2 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">${ssrInterpolate(unref(blogAuthor).name)}</h2><p class="mt-4 max-w-2xl text-base leading-8 text-[var(--blog-muted)]">${ssrInterpolate(unref(blogAuthor).bio)}</p></div></div></div><div class="blog-panel p-6"><p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Contact</p><div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3"><!--[-->`);
      ssrRenderList(unref(contactLinks), (item) => {
        _push(`<a${ssrRenderAttr("href", item.href)}${ssrRenderAttr("target", item.href.startsWith("http") ? "_blank" : void 0)}${ssrRenderAttr("rel", item.href.startsWith("http") ? "noopener noreferrer" : void 0)} class="block rounded-[4px] border border-[var(--blog-border)] px-4 py-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"><p class="text-xs text-[var(--blog-subtle)]">${ssrInterpolate(item.label)}</p><p class="mt-1 text-sm font-medium text-[var(--blog-ink)]">${ssrInterpolate(item.value)}</p></a>`);
      });
      _push(`<!--]--></div></div>`);
      _push(ssrRenderComponent(_component_ActivityContributionGraph, { data: unref(activity) }, null, _parent));
      _push(ssrRenderComponent(_component_ProjectGrid, {
        projects: unref(projects) || []
      }, null, _parent));
      _push(`</div></section></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/about.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=about-DXr8oYSy.js.map
