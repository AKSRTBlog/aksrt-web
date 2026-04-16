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
    :class="`flex w-full items-center gap-3 rounded-[4px] border border-[var(--blog-border)] bg-white/92 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${className}`.trim()"
    @submit.prevent="handleSubmit"
  >
    <span class="text-[var(--blog-muted)]">Q</span>
    <input
      v-model="keyword"
      class="w-full bg-transparent text-sm text-[var(--blog-ink)] outline-none placeholder:text-[var(--blog-subtle)]"
      type="search"
      :placeholder="placeholder"
    >
    <button class="blog-button-primary shrink-0" type="submit">Search</button>
  </form>
</template>
