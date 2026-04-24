<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

await navigateTo(
  {
    path: '/admin/settings',
    query: { tab: 'commentModeration' },
  },
  {
    replace: true,
  },
)
</script>

<template>
  <div class="admin-card px-5 py-10 text-center text-sm text-slate-500">
    正在跳转到站点设置...
  </div>
</template>
