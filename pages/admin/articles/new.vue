<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin-auth'],
})

useHead({
  title: '新建文章',
})
</script>

<template>
  <div class="admin-page-container">
    <AdminPageHeader
      title="新建文章"
      description="创建一个新的文章草稿或直接发布。"
    >
      <template #actions>
        <NuxtLink class="admin-button-secondary" :to="useAdminPaths().articles">
          返回列表
        </NuxtLink>
      </template>
    </AdminPageHeader>

    <AdminArticleEditor />
  </div>
</template>
