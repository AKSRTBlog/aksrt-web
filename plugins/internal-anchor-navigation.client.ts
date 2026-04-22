function hasModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
}

function hasLikelyFileExtension(pathname: string) {
  const segment = pathname.split('/').pop() || ''
  return /\.[a-z0-9]{1,8}$/i.test(segment)
}

function isSpaRoutablePath(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/archive' ||
    pathname === '/search' ||
    pathname === '/links' ||
    pathname.startsWith('/articles/') ||
    pathname.startsWith('/pages/') ||
    pathname.startsWith('/tags/') ||
    pathname.startsWith('/categories/') ||
    pathname.startsWith('/admin/')
  )
}

function shouldSkipSpaNavigation(anchor: HTMLAnchorElement, url: URL) {
  const target = anchor.getAttribute('target')
  if (target && target.toLowerCase() !== '_self') {
    return true
  }

  const rawHref = anchor.getAttribute('href')?.trim() || ''
  if (!rawHref || rawHref.startsWith('#')) {
    return true
  }

  if (
    rawHref.startsWith('mailto:') ||
    rawHref.startsWith('tel:') ||
    rawHref.startsWith('javascript:')
  ) {
    return true
  }

  if (anchor.hasAttribute('download') || anchor.dataset.noSpa === 'true') {
    return true
  }

  if (url.origin !== window.location.origin) {
    return true
  }

  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/storage/') ||
    url.pathname.startsWith('/uploads/')
  ) {
    return true
  }

  if (hasLikelyFileExtension(url.pathname) && !isSpaRoutablePath(url.pathname)) {
    return true
  }

  return false
}

export default defineNuxtPlugin(() => {
  function handleDocumentClick(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0 || hasModifiedClick(event)) {
      return
    }

    const target = event.target as Element | null
    const anchor = target?.closest('a') as HTMLAnchorElement | null
    if (!anchor) {
      return
    }

    const href = anchor.getAttribute('href')?.trim()
    if (!href) {
      return
    }

    let url: URL
    try {
      url = new URL(anchor.href, window.location.href)
    }
    catch {
      return
    }

    if (shouldSkipSpaNavigation(anchor, url)) {
      return
    }

    event.preventDefault()
    void navigateTo(`${url.pathname}${url.search}${url.hash}`)
  }

  document.addEventListener('click', handleDocumentClick)

  window.addEventListener(
    'beforeunload',
    () => {
      document.removeEventListener('click', handleDocumentClick)
    },
    { once: true },
  )
})
