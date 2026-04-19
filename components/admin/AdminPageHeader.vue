<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="mb-6 min-w-0 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
    <div class="min-w-0">
      <h2 class="admin-page-title">{{ title }}</h2>
      <p class="admin-page-description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="min-w-0 flex flex-wrap gap-2 sm:gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>
