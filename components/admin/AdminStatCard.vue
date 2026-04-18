<script setup lang="ts">
defineProps<{
  marker: string
  label: string
  value: string
  change?: string
}>()
</script>

<template>
  <div class="admin-card p-4 sm:p-5">
    <div class="flex items-start justify-between gap-2">
      <div class="admin-icon-chip text-sm font-semibold">
        {{ marker }}
      </div>
      <span v-if="change" class="max-w-[60%] truncate rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 sm:max-w-none sm:px-2.5">{{ change }}</span>
    </div>
    <p class="mt-4 text-2xl font-semibold tracking-[-0.03em] text-slate-900 sm:mt-5 sm:text-3xl">{{ value }}</p>
    <p class="mt-1.5 text-xs text-slate-500 sm:mt-2 sm:text-sm">{{ label }}</p>
  </div>
</template>
