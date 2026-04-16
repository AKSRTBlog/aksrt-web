
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T> = DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>> & T

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }> & T

interface _GlobalComponents {
  ActivityContributionGraph: typeof import("../../components/ActivityContributionGraph.vue")['default']
  AppImage: typeof import("../../components/AppImage.vue")['default']
  ArticleCard: typeof import("../../components/ArticleCard.vue")['default']
  ArticleFeed: typeof import("../../components/ArticleFeed.vue")['default']
  BannerShowcase: typeof import("../../components/BannerShowcase.vue")['default']
  CommentSection: typeof import("../../components/CommentSection.vue")['default']
  CommentThread: typeof import("../../components/CommentThread.vue")['default']
  EmptyState: typeof import("../../components/EmptyState.vue")['default']
  MarkdownContent: typeof import("../../components/MarkdownContent.vue")['default']
  PageHero: typeof import("../../components/PageHero.vue")['default']
  ProjectGrid: typeof import("../../components/ProjectGrid.vue")['default']
  SearchForm: typeof import("../../components/SearchForm.vue")['default']
  SiteFooter: typeof import("../../components/SiteFooter.vue")['default']
  SiteHeader: typeof import("../../components/SiteHeader.vue")['default']
  SiteSidebar: typeof import("../../components/SiteSidebar.vue")['default']
  AdminArticleEditor: typeof import("../../components/admin/AdminArticleEditor.vue")['default']
  AdminNavIcon: typeof import("../../components/admin/AdminNavIcon.vue")['default']
  AdminPageHeader: typeof import("../../components/admin/AdminPageHeader.vue")['default']
  AdminPagination: typeof import("../../components/admin/AdminPagination.vue")['default']
  AdminSearchField: typeof import("../../components/admin/AdminSearchField.vue")['default']
  AdminStatCard: typeof import("../../components/admin/AdminStatCard.vue")['default']
  AdminStatusBadge: typeof import("../../components/admin/AdminStatusBadge.vue")['default']
  AdminMarkdownPreview: typeof import("../../components/admin/MarkdownPreview.vue")['default']
  AdminMarkdownToolbar: typeof import("../../components/admin/MarkdownToolbar.vue")['default']
  AdminMediaPickerDialog: typeof import("../../components/admin/MediaPickerDialog.vue")['default']
  NuxtWelcome: typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']
  NuxtLayout: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
  NuxtErrorBoundary: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
  ClientOnly: typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']
  DevOnly: typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']
  ServerPlaceholder: typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']
  NuxtLink: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']
  NuxtLoadingIndicator: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
  NuxtTime: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
  NuxtRouteAnnouncer: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
  NuxtImg: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
  NuxtPicture: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
  NuxtPage: typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']
  NoScript: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']
  Link: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']
  Base: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']
  Title: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']
  Meta: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']
  Style: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']
  Head: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']
  Html: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']
  Body: typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']
  NuxtIsland: typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']
  LazyActivityContributionGraph: LazyComponent<typeof import("../../components/ActivityContributionGraph.vue")['default']>
  LazyAppImage: LazyComponent<typeof import("../../components/AppImage.vue")['default']>
  LazyArticleCard: LazyComponent<typeof import("../../components/ArticleCard.vue")['default']>
  LazyArticleFeed: LazyComponent<typeof import("../../components/ArticleFeed.vue")['default']>
  LazyBannerShowcase: LazyComponent<typeof import("../../components/BannerShowcase.vue")['default']>
  LazyCommentSection: LazyComponent<typeof import("../../components/CommentSection.vue")['default']>
  LazyCommentThread: LazyComponent<typeof import("../../components/CommentThread.vue")['default']>
  LazyEmptyState: LazyComponent<typeof import("../../components/EmptyState.vue")['default']>
  LazyMarkdownContent: LazyComponent<typeof import("../../components/MarkdownContent.vue")['default']>
  LazyPageHero: LazyComponent<typeof import("../../components/PageHero.vue")['default']>
  LazyProjectGrid: LazyComponent<typeof import("../../components/ProjectGrid.vue")['default']>
  LazySearchForm: LazyComponent<typeof import("../../components/SearchForm.vue")['default']>
  LazySiteFooter: LazyComponent<typeof import("../../components/SiteFooter.vue")['default']>
  LazySiteHeader: LazyComponent<typeof import("../../components/SiteHeader.vue")['default']>
  LazySiteSidebar: LazyComponent<typeof import("../../components/SiteSidebar.vue")['default']>
  LazyAdminArticleEditor: LazyComponent<typeof import("../../components/admin/AdminArticleEditor.vue")['default']>
  LazyAdminNavIcon: LazyComponent<typeof import("../../components/admin/AdminNavIcon.vue")['default']>
  LazyAdminPageHeader: LazyComponent<typeof import("../../components/admin/AdminPageHeader.vue")['default']>
  LazyAdminPagination: LazyComponent<typeof import("../../components/admin/AdminPagination.vue")['default']>
  LazyAdminSearchField: LazyComponent<typeof import("../../components/admin/AdminSearchField.vue")['default']>
  LazyAdminStatCard: LazyComponent<typeof import("../../components/admin/AdminStatCard.vue")['default']>
  LazyAdminStatusBadge: LazyComponent<typeof import("../../components/admin/AdminStatusBadge.vue")['default']>
  LazyAdminMarkdownPreview: LazyComponent<typeof import("../../components/admin/MarkdownPreview.vue")['default']>
  LazyAdminMarkdownToolbar: LazyComponent<typeof import("../../components/admin/MarkdownToolbar.vue")['default']>
  LazyAdminMediaPickerDialog: LazyComponent<typeof import("../../components/admin/MediaPickerDialog.vue")['default']>
  LazyNuxtWelcome: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
  LazyNuxtLayout: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
  LazyNuxtErrorBoundary: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
  LazyClientOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/client-only")['default']>
  LazyDevOnly: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/dev-only")['default']>
  LazyServerPlaceholder: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
  LazyNuxtLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
  LazyNuxtLoadingIndicator: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
  LazyNuxtTime: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
  LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
  LazyNuxtImg: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
  LazyNuxtPicture: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
  LazyNuxtPage: LazyComponent<typeof import("../../node_modules/nuxt/dist/pages/runtime/page")['default']>
  LazyNoScript: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
  LazyLink: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Link']>
  LazyBase: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Base']>
  LazyTitle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Title']>
  LazyMeta: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Meta']>
  LazyStyle: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Style']>
  LazyHead: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Head']>
  LazyHtml: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Html']>
  LazyBody: LazyComponent<typeof import("../../node_modules/nuxt/dist/head/runtime/components")['Body']>
  LazyNuxtIsland: LazyComponent<typeof import("../../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
