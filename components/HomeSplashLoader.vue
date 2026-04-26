<script setup lang="ts">
const props = defineProps<{
  logoUrl?: string;
  siteTitle?: string;
  visible: boolean;
}>();

const logoFailed = ref(false);
const hasLogo = computed(() => Boolean(props.logoUrl && !logoFailed.value));
const title = computed(() => {
  const value = typeof props.siteTitle === 'string' ? props.siteTitle.trim() : '';
  return value || 'Blog';
});
const fallbackInitials = computed(() => title.value.slice(0, 2).toUpperCase());

watch(
  () => props.logoUrl,
  () => {
    logoFailed.value = false;
  },
);
</script>

<template>
  <Transition name="home-splash-fade">
    <div v-if="visible" class="home-splash-loader" role="status" aria-live="polite" aria-label="首页加载中">
      <div class="home-splash-loader__mark" aria-hidden="true">
        <img
          v-if="hasLogo"
          class="home-splash-loader__logo"
          :src="logoUrl"
          :alt="title"
          @error="logoFailed = true"
        >
        <span v-else class="home-splash-loader__fallback">{{ fallbackInitials }}</span>
      </div>
      <p class="home-splash-loader__title">{{ title }}</p>
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
  gap: 12px;
  background: color-mix(in srgb, white 92%, transparent);
}

.home-splash-loader__mark {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--blog-border) 78%, transparent);
  border-radius: 18px;
  background: white;
  box-shadow: 0 18px 50px color-mix(in srgb, var(--blog-ink) 12%, transparent);
  animation: home-splash-mark 0.58s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-splash-loader__logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-splash-loader__fallback {
  font-size: 18px;
  font-weight: 800;
  color: var(--blog-accent);
}

.home-splash-loader__title {
  max-width: min(280px, 80vw);
  margin: 0;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--blog-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: home-splash-title 0.46s ease-out 0.08s both;
}

.home-splash-fade-enter-active,
.home-splash-fade-leave-active {
  transition: opacity 0.22s ease;
}

.home-splash-fade-enter-from,
.home-splash-fade-leave-to {
  opacity: 0;
}

@keyframes home-splash-mark {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.92);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes home-splash-title {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .home-splash-loader__mark,
  .home-splash-loader__title {
    animation: none;
  }

  .home-splash-fade-enter-active,
  .home-splash-fade-leave-active {
    transition: none;
  }
}
</style>
