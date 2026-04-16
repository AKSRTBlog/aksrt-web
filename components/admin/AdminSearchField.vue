<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()
const modelValue = defineModel<string>({ default: '' })

defineProps<{
  placeholder: string
}>()
</script>

<template>
  <label class="admin-search-field">
    <svg class="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0a7 7 0 0 1 14 0Z" />
    </svg>
    <input
      v-model="modelValue"
      v-bind="attrs"
      class="admin-input min-w-0 flex-1 border-0 bg-transparent px-0 py-0 shadow-none focus:ring-0"
      type="search"
      :placeholder="placeholder"
    >
  </label>
</template>
