import type { PublicDataInvalidationPayload } from '~/composables/usePublicDataInvalidation'
import { PUBLIC_DATA_INVALIDATION_EVENT } from '~/composables/usePublicDataInvalidation'

interface PublicLiveReloadOptions {
  debounceMs?: number
}

export function usePublicLiveReload(
  reloadHandler: () => void | Promise<void>,
  options: PublicLiveReloadOptions = {},
) {
  if (!import.meta.client) {
    return
  }

  let timer: ReturnType<typeof setTimeout> | null = null
  let running = false
  let pending = false

  const debounceMs = Math.max(0, options.debounceMs ?? 120)

  async function run() {
    if (running) {
      pending = true
      return
    }

    running = true
    pending = false

    try {
      await reloadHandler()
    }
    catch {
      // Keep page interactive if auto refresh fails.
    }
    finally {
      running = false
      if (pending) {
        pending = false
        await run()
      }
    }
  }

  function scheduleRun() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (!debounceMs) {
      void run()
      return
    }

    timer = setTimeout(() => {
      timer = null
      void run()
    }, debounceMs)
  }

  function handleInvalidation(_event: Event) {
    const customEvent = _event as CustomEvent<PublicDataInvalidationPayload>
    if (!customEvent.detail) {
      return
    }

    scheduleRun()
  }

  onMounted(() => {
    window.addEventListener(PUBLIC_DATA_INVALIDATION_EVENT, handleInvalidation as EventListener)
  })

  onBeforeUnmount(() => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    window.removeEventListener(PUBLIC_DATA_INVALIDATION_EVENT, handleInvalidation as EventListener)
  })
}
