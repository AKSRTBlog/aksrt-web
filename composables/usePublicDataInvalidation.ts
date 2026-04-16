interface InvalidatePublicDataOptions {
  keys?: string[]
  prefixes?: string[]
}

const DEFAULT_PUBLIC_DATA_KEYS = [
  'site-settings',
  'home-articles',
  'home-banners',
  'shared-all-articles',
  'articles-categories',
  'category-categories',
  'friend-links',
  'about-activity',
  'about-projects',
]

const DEFAULT_PUBLIC_DATA_PREFIXES = [
  'article-',
  'standalone-',
]

export function usePublicDataInvalidation() {
  function invalidatePublicData(options: InvalidatePublicDataOptions = {}) {
    try {
      const nuxtApp = useNuxtApp()
      const payload = nuxtApp.payload as { data?: Record<string, unknown> | null }

      if (!payload.data || typeof payload.data !== 'object') {
        payload.data = {}
      }

      const keys = options.keys ?? DEFAULT_PUBLIC_DATA_KEYS
      const prefixes = options.prefixes ?? DEFAULT_PUBLIC_DATA_PREFIXES

      for (const key of keys) {
        clearNuxtData(key)
      }

      for (const key of Object.keys(payload.data)) {
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          clearNuxtData(key)
        }
      }
    }
    catch {
      // Cache invalidation must never block admin save/update flows.
    }
  }

  return {
    invalidatePublicData,
  }
}
