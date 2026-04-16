<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tone?: 'default' | 'success' | 'warning' | 'danger'
  }>(),
  {
    tone: 'default',
  },
)

const toneClass = computed(() => {
  if (props.tone === 'success') {
    return 'admin-badge-success'
  }

  if (props.tone === 'warning') {
    return 'admin-badge-warning'
  }

  if (props.tone === 'danger') {
    return 'admin-badge-danger'
  }

  return 'admin-badge-default'
})
</script>

<template>
  <span :class="['admin-badge', toneClass]">
    <slot />
  </span>
</template>
