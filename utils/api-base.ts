const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '0.0.0.0'])

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

export function resolveApiBase(configuredApiBase: string) {
  // Empty string = same-origin (production mode where Rust serves both)
  if (!configuredApiBase) {
    return ''
  }

  const fallback = trimTrailingSlash(configuredApiBase)

  if (import.meta.server) {
    return fallback
  }

  try {
    const resolved = new URL(configuredApiBase, window.location.origin)

    if (!LOOPBACK_HOSTS.has(resolved.hostname)) {
      return trimTrailingSlash(resolved.toString())
    }

    if (!window.location.hostname || LOOPBACK_HOSTS.has(window.location.hostname)) {
      return trimTrailingSlash(resolved.toString())
    }

    resolved.hostname = window.location.hostname
    return trimTrailingSlash(resolved.toString())
  } catch {
    return fallback
  }
}

type RuntimeApiConfig = {
  apiBaseInternal?: string
  public: {
    apiBase: string
  }
}

export function resolveRuntimeApiBase(config: RuntimeApiConfig) {
  const serverApiBase = String(config.apiBaseInternal || '')
  return resolveApiBase(import.meta.server ? serverApiBase : config.public.apiBase)
}
