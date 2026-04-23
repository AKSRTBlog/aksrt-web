<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();
</script>

<template>
  <Transition name="home-splash-fade">
    <div v-if="visible" class="home-splash-loader" role="status" aria-live="polite" aria-label="首页加载中">
      <div class="home-splash-loader__spinner" aria-hidden="true" />
      <p class="home-splash-loader__text">正在加载首页...</p>
    </div>
  </Transition>
</template>

<style scoped>
.home-splash-loader {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: color-mix(in srgb, white 90%, transparent);
  backdrop-filter: blur(2px);
}

.home-splash-loader__spinner {
  width: 32px;
  height: 32px;
  border: 2px solid color-mix(in srgb, var(--blog-border) 70%, transparent);
  border-top-color: var(--blog-accent);
  border-radius: 999px;
  animation: home-splash-spin 0.68s linear infinite;
}

.home-splash-loader__text {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.01em;
  color: var(--blog-muted);
}

.home-splash-fade-enter-active,
.home-splash-fade-leave-active {
  transition: opacity 0.22s ease;
}

.home-splash-fade-enter-from,
.home-splash-fade-leave-to {
  opacity: 0;
}

@keyframes home-splash-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-splash-loader__spinner {
    animation: none;
  }

  .home-splash-fade-enter-active,
  .home-splash-fade-leave-active {
    transition: none;
  }
}
</style>
