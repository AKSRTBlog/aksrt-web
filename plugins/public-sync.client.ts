import { fetchPublicSyncVersion } from '~/composables/api'
import {
  parsePublicDataInvalidationPayload,
  PUBLIC_DATA_INVALIDATION_CHANNEL,
  PUBLIC_DATA_INVALIDATION_EVENT,
  PUBLIC_DATA_INVALIDATION_STORAGE_KEY,
  PUBLIC_DATA_SYNC_SOURCE_ID,
} from '~/composables/usePublicDataInvalidation'

const PUBLIC_SYNC_POLL_INTERVAL_MS = 30_000
const PUBLIC_SYNC_REFRESH_DEBOUNCE_MS = 80

export default defineNuxtPlugin(() => {
  const { invalidatePublicData } = usePublicDataInvalidation()
  let knownVersion: string | null = null
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let pollTimer: ReturnType<typeof setInterval> | null = null
  let dedupeMarker = ''
  let broadcastChannel: BroadcastChannel | null = null

  function normalizeVersion(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null
  }

  function scheduleNuxtDataRefresh() {
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = null
    }

    refreshTimer = setTimeout(() => {
      refreshTimer = null
      void refreshNuxtData()
    }, PUBLIC_SYNC_REFRESH_DEBOUNCE_MS)
  }

  async function checkSyncVersion() {
    try {
      const result = await fetchPublicSyncVersion()
      const currentVersion = normalizeVersion(result?.version)
      if (!currentVersion) {
        return
      }

      if (!knownVersion) {
        knownVersion = currentVersion
        return
      }

      if (currentVersion === knownVersion) {
        return
      }

      knownVersion = currentVersion
      invalidatePublicData({
        broadcast: false,
        reason: 'poll-version-updated',
        version: currentVersion,
      })
    }
    catch {
      // Polling errors should never interrupt user interaction.
    }
  }

  function applyCrossTabInvalidation(rawPayload: unknown) {
    const payload = parsePublicDataInvalidationPayload(rawPayload)
    if (!payload || payload.sourceId === PUBLIC_DATA_SYNC_SOURCE_ID) {
      return
    }

    const marker = `${payload.sourceId}:${payload.timestamp}`
    if (marker === dedupeMarker) {
      return
    }

    dedupeMarker = marker
    invalidatePublicData({
      broadcast: false,
      reason: payload.reason,
      version: payload.version,
    })
  }

  function handleStorageEvent(event: StorageEvent) {
    if (event.key !== PUBLIC_DATA_INVALIDATION_STORAGE_KEY || !event.newValue) {
      return
    }

    try {
      applyCrossTabInvalidation(JSON.parse(event.newValue))
    }
    catch {
      // Ignore broken storage payloads.
    }
  }

  function handleBroadcastEvent(event: MessageEvent) {
    applyCrossTabInvalidation(event.data)
  }

  function handleLocalInvalidation() {
    scheduleNuxtDataRefresh()
  }

  function handleVisibilityChange() {
    if (!document.hidden) {
      void checkSyncVersion()
    }
  }

  window.addEventListener(PUBLIC_DATA_INVALIDATION_EVENT, handleLocalInvalidation)
  window.addEventListener('storage', handleStorageEvent)
  document.addEventListener('visibilitychange', handleVisibilityChange)

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      broadcastChannel = new BroadcastChannel(PUBLIC_DATA_INVALIDATION_CHANNEL)
      broadcastChannel.addEventListener('message', handleBroadcastEvent)
    }
    catch {
      broadcastChannel = null
    }
  }

  void checkSyncVersion()
  pollTimer = setInterval(() => {
    if (!document.hidden) {
      void checkSyncVersion()
    }
  }, PUBLIC_SYNC_POLL_INTERVAL_MS)

  window.addEventListener(
    'beforeunload',
    () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer)
        refreshTimer = null
      }

      if (pollTimer) {
        clearInterval(pollTimer)
        pollTimer = null
      }

      window.removeEventListener(PUBLIC_DATA_INVALIDATION_EVENT, handleLocalInvalidation)
      window.removeEventListener('storage', handleStorageEvent)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handleBroadcastEvent)
        broadcastChannel.close()
        broadcastChannel = null
      }
    },
    { once: true },
  )
})
