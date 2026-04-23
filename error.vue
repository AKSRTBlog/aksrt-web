<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => Number(props.error?.statusCode || 500))
const isNotFound = computed(() => statusCode.value === 404)

const title = computed(() => (isNotFound.value ? 'Page not found' : 'Something went wrong'))
const description = computed(() => {
  if (isNotFound.value) {
    return 'The page you are looking for does not exist, was moved, or is temporarily unavailable.'
  }

  return props.error?.message || 'An unexpected error occurred. Please try again later.'
})

function goHome() {
  clearError({ redirect: '/' })
}

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    window.history.back()
    return
  }

  goHome()
}

useSeoMeta({
  title: () => `${statusCode.value} ${title.value}`,
  description: () => description.value,
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="min-h-screen bg-[var(--blog-bg)] px-6 py-16 text-[var(--blog-ink)]">
    <div class="mx-auto max-w-3xl">
      <div class="blog-panel p-8 text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--blog-subtle)]">
          {{ statusCode }}
        </p>
        <h1 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">
          {{ title }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--blog-muted)]">
          {{ description }}
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button class="blog-button-primary" type="button" @click="goHome">
            Back to home
          </button>
          <button class="blog-button-secondary" type="button" @click="goBack">
            Go back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
