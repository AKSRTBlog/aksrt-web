<script setup lang="ts">
defineProps<{
  marker: string
  label: string
  value: string
  change?: string
}>()
</script>

<template>
  <div class="admin-card p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="admin-icon-chip text-sm font-semibold">
        {{ marker }}
      </div>
      <span v-if="change" class="admin-badge admin-badge-success">{{ change }}</span>
    </div>
    <p class="mt-5 text-3xl font-semibold tracking-[-0.03em] text-slate-900">{{ value }}</p>
    <p class="mt-2 text-sm text-slate-500">{{ label }}</p>
  </div>
</template>
