<script setup lang="ts">
import type { AdminNavIconName } from '~/utils/admin'

const props = defineProps<{
  name:
    | AdminNavIconName
    | 'home'
    | 'logout'
    | 'menu'
    | 'close'
}>()
</script>

<template>
  <svg
    v-if="props.name === 'dashboard'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4h6v7H4zM14 4h6v5h-6zM14 11h6v9h-6zM4 15h6v5H4z" />
  </svg>

  <svg
    v-else-if="props.name === 'articles'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h8M8 10h8M8 14h5M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1Z" />
  </svg>

  <svg
    v-else-if="props.name === 'comments'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>

  <svg
    v-else-if="props.name === 'pages'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3h8l4 4v14H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 3v5h4M10 12h6M10 16h6" />
  </svg>

  <svg
    v-else-if="props.name === 'friend-links'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 13a5 5 0 0 0 7.07 0l2.12-2.12a5 5 0 0 0-7.07-7.07L10.7 5.22" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 11a5 5 0 0 0-7.07 0L4.81 13.1a5 5 0 1 0 7.07 7.07l1.41-1.41" />
  </svg>

  <svg
    v-else-if="props.name === 'content'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12M8 12h12M8 17h12" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h.01M3 12h.01M3 17h.01" />
  </svg>

  <svg
    v-else-if="props.name === 'banners'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="14" rx="2" stroke-width="2" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m7 15 3-3 2 2 4-4 3 3" />
    <circle cx="9" cy="9" r="1.5" stroke-width="2" />
  </svg>

  <svg
    v-else-if="props.name === 'media'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16v12H4z" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M6 16l4-4 3 3 2-2 3 3" />
  </svg>

  <svg
    v-else-if="props.name === 'projects'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>

  <svg
    v-else-if="props.name === 'settings'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2.25M12 18.75V21M4.72 4.72l1.59 1.59M17.69 17.69l1.59 1.59M3 12h2.25M18.75 12H21M4.72 19.28l1.59-1.59M17.69 6.31l1.59-1.59" />
    <circle cx="12" cy="12" r="3.25" stroke-width="2" />
  </svg>

  <svg
    v-else-if="props.name === 'admins'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="8" r="4" stroke-width="2" />
  </svg>

  <svg
    v-else-if="props.name === 'home'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10.5 12 3l9 7.5" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 9.5V21h14V9.5" />
  </svg>

  <svg
    v-else-if="props.name === 'logout'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 17l5-5-5-5" />
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H4" />
  </svg>

  <svg
    v-else-if="props.name === 'menu'"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h16" />
  </svg>

  <svg
    v-else
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M18 6 6 18" />
  </svg>
</template>
