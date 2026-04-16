<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    page: number
    totalPages: number
    total: number
    label?: string
  }>(),
  {
    label: '条数据',
  },
)

const emit = defineEmits<{
  'update:page': [page: number]
}>()

function goToPrevious() {
  emit('update:page', Math.max(1, props.page - 1))
}

function goToNext() {
  emit('update:page', Math.min(props.totalPages, props.page + 1))
}
</script>

<template>
  <div class="admin-pagination">
    <p class="text-sm text-slate-500">
      共 {{ total }} {{ label }}，第 {{ page }} / {{ totalPages }} 页
    </p>
    <div class="flex items-center gap-2">
      <button class="admin-button-secondary" type="button" :disabled="page <= 1" @click="goToPrevious">
        上一页
      </button>
      <button class="admin-button-secondary" type="button" :disabled="page >= totalPages" @click="goToNext">
        下一页
      </button>
    </div>
  </div>
</template>
