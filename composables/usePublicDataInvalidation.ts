interface InvalidatePublicDataOptions {
  keys?: string[]
  prefixes?: string[]
  broadcast?: boolean
  reason?: string
  version?: string
}

export interface PublicDataInvalidationPayload {
  timestamp: number
  sourceId: string
  reason: string
  version?: string
}

export const PUBLIC_DATA_INVALIDATION_EVENT = 'aksrt:public-data-invalidated'
export const PUBLIC_DATA_INVALIDATION_CHANNEL = 'aksrt:public-data-invalidation'
export const PUBLIC_DATA_INVALIDATION_STORAGE_KEY = 'aksrt:public-data-invalidation'
export const PUBLIC_DATA_SYNC_SOURCE_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

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

function normalizeVersion(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function buildPayload(options: InvalidatePublicDataOptions): PublicDataInvalidationPayload {
  return {
    timestamp: Date.now(),
    sourceId: PUBLIC_DATA_SYNC_SOURCE_ID,
    reason: typeof options.reason === 'string' && options.reason.trim() ? options.reason.trim() : 'manual',
    version: normalizeVersion(options.version),
  }
}

export function parsePublicDataInvalidationPayload(raw: unknown): PublicDataInvalidationPayload | null {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const payload = raw as Partial<PublicDataInvalidationPayload>
  if (typeof payload.timestamp !== 'number' || !Number.isFinite(payload.timestamp)) {
    return null
  }

  if (typeof payload.sourceId !== 'string' || !payload.sourceId.trim()) {
    return null
  }

  if (typeof payload.reason !== 'string' || !payload.reason.trim()) {
    return null
  }

  return {
    timestamp: payload.timestamp,
    sourceId: payload.sourceId,
    reason: payload.reason,
    version: normalizeVersion(payload.version),
  }
}

function emitLocalInvalidation(payload: PublicDataInvalidationPayload) {
  if (!import.meta.client) {
    return
  }

  window.dispatchEvent(
    new CustomEvent(PUBLIC_DATA_INVALIDATION_EVENT, {
      detail: payload,
    }),
  )
}

function broadcastInvalidation(payload: PublicDataInvalidationPayload) {
  if (!import.meta.client) {
    return
  }

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(PUBLIC_DATA_INVALIDATION_CHANNEL)
      channel.postMessage(payload)
      channel.close()
    }
  }
  catch {
    // Broadcast failure must never block admin save/update flows.
  }

  try {
    localStorage.setItem(PUBLIC_DATA_INVALIDATION_STORAGE_KEY, JSON.stringify(payload))
  }
  catch {
    // Storage failure must never block admin save/update flows.
  }
}

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
    const payload = buildPayload(options)

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

    emitLocalInvalidation(payload)

    if (options.broadcast !== false) {
      broadcastInvalidation(payload)
    }
  }

  return {
    invalidatePublicData,
  }
}
