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
  function ensureDataStore(app: Record<string, any>, scope: 'payload' | 'static') {
    if (!app[scope] || typeof app[scope] !== 'object') {
      app[scope] = {}
    }

    if (!app[scope].data || typeof app[scope].data !== 'object') {
      app[scope].data = {}
    }

    return app[scope].data as Record<string, unknown>
  }

  function invalidatePublicData(options: InvalidatePublicDataOptions = {}) {
    try {
      const nuxtApp = useNuxtApp() as unknown as Record<string, any>
      const payloadData = ensureDataStore(nuxtApp, 'payload')
      const staticData = ensureDataStore(nuxtApp, 'static')

      const keys = options.keys ?? DEFAULT_PUBLIC_DATA_KEYS
      const prefixes = options.prefixes ?? DEFAULT_PUBLIC_DATA_PREFIXES
      const invalidationKeys = new Set(keys)

      for (const key of Object.keys(payloadData)) {
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          invalidationKeys.add(key)
        }
      }

      for (const key of Object.keys(staticData)) {
        if (prefixes.some(prefix => key.startsWith(prefix))) {
          invalidationKeys.add(key)
        }
      }

      for (const key of invalidationKeys) {
        delete payloadData[key]
        delete staticData[key]

        try {
          clearNuxtData(key)
        }
        catch {
          // Ignore Nuxt internal cache errors and keep save flow successful.
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
