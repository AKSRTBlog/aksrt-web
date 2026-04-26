export type NavigationIcon =
  | { type: 'iconify'; name: string }
  | { type: 'fontawesome'; className: string }

const FA_STYLE_CLASSES = new Set([
  'fa-solid',
  'fa-regular',
  'fa-brands',
])

function normalizeFontAwesomeClasses(raw: string) {
  const parts = raw
    .split(/\s+/)
    .map(part => part.trim().toLowerCase())
    .filter(Boolean)

  if (parts.length === 0) return ''

  const style = parts.find(part => FA_STYLE_CLASSES.has(part)) ?? 'fa-solid'
  const icon = parts.find(part => part !== style && part.startsWith('fa-'))
    ?? parts.find(part => part !== style)

  if (!icon) return ''

  return `${style} ${icon.startsWith('fa-') ? icon : `fa-${icon}`}`
}

export function resolveNavigationIcon(iconName?: string | null): NavigationIcon | null {
  const raw = iconName?.trim()
  if (!raw) return null

  if (raw.startsWith('fa6-') || raw.includes(':')) {
    return { type: 'iconify', name: raw }
  }

  if (raw.startsWith('fa-')) {
    const className = normalizeFontAwesomeClasses(raw)
    return className ? { type: 'fontawesome', className } : null
  }

  return { type: 'iconify', name: `lucide:${raw.toLowerCase()}` }
}

export function resolveNavigationIconName(iconName?: string | null) {
  const icon = resolveNavigationIcon(iconName)
  return icon?.type === 'iconify' ? icon.name : ''
}

export function resolveNavigationIconClass(iconName?: string | null) {
  const icon = resolveNavigationIcon(iconName)
  return icon?.type === 'fontawesome' ? icon.className : ''
}
