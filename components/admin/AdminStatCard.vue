<script setup lang="ts">
defineProps<{
  marker: string
  label: string
  value: string
  change?: string
}>()
</script>

<template>
  <div class="admin-card min-w-0 p-3 sm:p-5">
    <div class="flex min-w-0 items-start justify-between gap-1.5 sm:gap-2">
      <div class="shrink-0 admin-icon-chip text-sm font-semibold">
        {{ marker }}
      </div>
      <span v-if="change" class="shrink-0 max-w-[55%] truncate rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 sm:max-w-none sm:px-2 sm:text-xs">{{ change }}</span>
    </div>
    <p class="mt-3 truncate text-xl font-semibold tracking-[-0.03em] text-slate-900 sm:mt-5 sm:text-3xl">{{ value }}</p>
    <p class="mt-1 text-[11px] text-slate-500 sm:mt-2 sm:text-sm">{{ label }}</p>
  </div>
</template>
