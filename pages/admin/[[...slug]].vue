<script setup lang="ts">
import { adminPaths } from '~/utils/admin'

definePageMeta({
  layout: false,
  middleware: 'admin-auth',
});

useHead({
  title: 'Redirecting…',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
});

await navigateTo(adminPaths.dashboard, {
  replace: true,
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
    Redirecting to the admin dashboard...
  </div>
</template>
