<script setup lang="ts">
onMounted(() => {
  document.addEventListener('nuxt-hydrated', () => {
    console.log('[Hydration Debug] Hydration completed');
  }, { once: true });
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
