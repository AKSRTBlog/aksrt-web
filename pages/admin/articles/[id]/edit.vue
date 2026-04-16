<script setup lang="ts">
definePageMeta({
  layout: false,
  middleware: ['admin-auth'],
})

const route = useRoute()

await navigateTo(`/admin/articles/${route.params.id as string}`, {
  replace: true,
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-300">
    Redirecting to the article editor...
  </div>
</template>
