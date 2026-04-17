<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string | null;
  alt?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
}>(), {
  src: '',
  alt: '',
  loading: 'lazy',
  decoding: 'async',
  fetchpriority: 'auto',
});

const imageRef = ref<HTMLImageElement | null>(null);
const loaded = ref(false);
const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const safeSrc = computed(() => typeof props.src === 'string' ? props.src.trim() : '');
const displaySrc = computed(() => safeSrc.value || transparentPixel);

function syncLoadedState() {
  if (imageRef.value?.complete) {
    loaded.value = true;
  }
}

watch(displaySrc, async () => {
  loaded.value = false;
  await nextTick();
  syncLoadedState();
}, { immediate: true });

onMounted(() => {
  loaded.value = imageRef.value?.complete ?? false;
});
</script>

<template>
  <img
    ref="imageRef"
    :src="displaySrc"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    :fetchpriority="fetchpriority"
    :class="[
      'transition-[opacity,filter] duration-500 motion-reduce:transition-none',
      loaded && safeSrc ? 'opacity-100 blur-0' : 'bg-slate-200/70',
    ]"
    @load="loaded = true"
    @error="loaded = true"
  >
</template>
