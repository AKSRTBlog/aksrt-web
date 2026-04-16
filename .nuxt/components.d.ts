
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


export const ActivityContributionGraph: typeof import("../components/ActivityContributionGraph.vue")['default']
export const AppImage: typeof import("../components/AppImage.vue")['default']
export const ArticleCard: typeof import("../components/ArticleCard.vue")['default']
export const ArticleFeed: typeof import("../components/ArticleFeed.vue")['default']
export const BannerShowcase: typeof import("../components/BannerShowcase.vue")['default']
export const CommentSection: typeof import("../components/CommentSection.vue")['default']
export const CommentThread: typeof import("../components/CommentThread.vue")['default']
export const EmptyState: typeof import("../components/EmptyState.vue")['default']
export const MarkdownContent: typeof import("../components/MarkdownContent.vue")['default']
export const PageHero: typeof import("../components/PageHero.vue")['default']
export const ProjectGrid: typeof import("../components/ProjectGrid.vue")['default']
export const SearchForm: typeof import("../components/SearchForm.vue")['default']
export const SiteFooter: typeof import("../components/SiteFooter.vue")['default']
export const SiteHeader: typeof import("../components/SiteHeader.vue")['default']
export const SiteSidebar: typeof import("../components/SiteSidebar.vue")['default']
export const AdminArticleEditor: typeof import("../components/admin/AdminArticleEditor.vue")['default']
export const AdminNavIcon: typeof import("../components/admin/AdminNavIcon.vue")['default']
export const AdminPageHeader: typeof import("../components/admin/AdminPageHeader.vue")['default']
export const AdminPagination: typeof import("../components/admin/AdminPagination.vue")['default']
export const AdminSearchField: typeof import("../components/admin/AdminSearchField.vue")['default']
export const AdminStatCard: typeof import("../components/admin/AdminStatCard.vue")['default']
export const AdminStatusBadge: typeof import("../components/admin/AdminStatusBadge.vue")['default']
export const AdminMarkdownPreview: typeof import("../components/admin/MarkdownPreview.vue")['default']
export const AdminMarkdownToolbar: typeof import("../components/admin/MarkdownToolbar.vue")['default']
export const AdminMediaPickerDialog: typeof import("../components/admin/MediaPickerDialog.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const LazyActivityContributionGraph: LazyComponent<typeof import("../components/ActivityContributionGraph.vue")['default']>
export const LazyAppImage: LazyComponent<typeof import("../components/AppImage.vue")['default']>
export const LazyArticleCard: LazyComponent<typeof import("../components/ArticleCard.vue")['default']>
export const LazyArticleFeed: LazyComponent<typeof import("../components/ArticleFeed.vue")['default']>
export const LazyBannerShowcase: LazyComponent<typeof import("../components/BannerShowcase.vue")['default']>
export const LazyCommentSection: LazyComponent<typeof import("../components/CommentSection.vue")['default']>
export const LazyCommentThread: LazyComponent<typeof import("../components/CommentThread.vue")['default']>
export const LazyEmptyState: LazyComponent<typeof import("../components/EmptyState.vue")['default']>
export const LazyMarkdownContent: LazyComponent<typeof import("../components/MarkdownContent.vue")['default']>
export const LazyPageHero: LazyComponent<typeof import("../components/PageHero.vue")['default']>
export const LazyProjectGrid: LazyComponent<typeof import("../components/ProjectGrid.vue")['default']>
export const LazySearchForm: LazyComponent<typeof import("../components/SearchForm.vue")['default']>
export const LazySiteFooter: LazyComponent<typeof import("../components/SiteFooter.vue")['default']>
export const LazySiteHeader: LazyComponent<typeof import("../components/SiteHeader.vue")['default']>
export const LazySiteSidebar: LazyComponent<typeof import("../components/SiteSidebar.vue")['default']>
export const LazyAdminArticleEditor: LazyComponent<typeof import("../components/admin/AdminArticleEditor.vue")['default']>
export const LazyAdminNavIcon: LazyComponent<typeof import("../components/admin/AdminNavIcon.vue")['default']>
export const LazyAdminPageHeader: LazyComponent<typeof import("../components/admin/AdminPageHeader.vue")['default']>
export const LazyAdminPagination: LazyComponent<typeof import("../components/admin/AdminPagination.vue")['default']>
export const LazyAdminSearchField: LazyComponent<typeof import("../components/admin/AdminSearchField.vue")['default']>
export const LazyAdminStatCard: LazyComponent<typeof import("../components/admin/AdminStatCard.vue")['default']>
export const LazyAdminStatusBadge: LazyComponent<typeof import("../components/admin/AdminStatusBadge.vue")['default']>
export const LazyAdminMarkdownPreview: LazyComponent<typeof import("../components/admin/MarkdownPreview.vue")['default']>
export const LazyAdminMarkdownToolbar: LazyComponent<typeof import("../components/admin/MarkdownToolbar.vue")['default']>
export const LazyAdminMediaPickerDialog: LazyComponent<typeof import("../components/admin/MediaPickerDialog.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>

export const componentNames: string[]
