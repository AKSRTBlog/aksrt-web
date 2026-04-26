<script setup lang="ts">
const props = withDefaults(defineProps<{
  initialValue?: string;
  placeholder?: string;
  className?: string;
}>(), {
  initialValue: '',
  placeholder: 'Search articles, tags, or topics',
  className: '',
});

const keyword = ref(props.initialValue);

watch(
  () => props.initialValue,
  (value) => {
    keyword.value = value;
  },
);

function handleSubmit() {
  const value = keyword.value.trim();
  return navigateTo(value ? `/search?q=${encodeURIComponent(value)}` : '/search');
}
</script>

<template>
  <form
    :class="`flex w-full items-center gap-3 rounded-xl border border-[var(--blog-border)] bg-white/92 px-3.5 py-2.5 ${className}`.trim()"
    @submit.prevent="handleSubmit"
  >
    <Icon name="lucide:search" class="h-4 w-4 shrink-0 text-[var(--blog-subtle)]" />
    <input
      v-model="keyword"
      class="w-full bg-transparent text-sm text-[var(--blog-ink)] outline-none placeholder:text-[var(--blog-subtle)]"
      type="search"
      :placeholder="placeholder"
    >
    <kbd class="hidden sm:inline-flex shrink-0 select-none rounded-md border border-[var(--blog-border)] bg-[var(--blog-soft)] px-1.5 py-0.5 text-[10px] font-medium tabular-nums leading-none text-[var(--blog-subtle)]">⌘K</kbd>
  </form>
</template>
