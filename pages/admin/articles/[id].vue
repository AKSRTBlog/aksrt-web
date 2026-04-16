<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

const route = useRoute()
const articleId = computed(() => route.params.id as string)

useHead({
  title: '编辑文章',
})
</script>

<template>
  <div class="admin-page-container">
    <AdminArticleEditor :article-id="articleId" />
  </div>
</template>
