<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

const mobileOpen = ref(false);

const navigationItems = computed(() =>
  (props.siteSettings?.navigationItems ?? []).filter((item) => item.enabled),
);
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-[var(--blog-border)] bg-[rgba(255,255,255,0.9)] backdrop-blur-xl lg:hidden">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <NuxtLink class="flex items-center gap-3" to="/">
        <AppImage
          v-if="siteSettings?.logoUrl"
          :src="siteSettings.logoUrl"
          :alt="siteSettings.siteTitle"
          class="h-11 w-11 rounded-2xl object-cover"
          loading="eager"
          fetchpriority="high"
        />
        <div
          v-else
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--blog-ink)] text-sm font-semibold text-white"
        >
          {{ (siteSettings?.siteTitle || 'Blog').slice(0, 2).toUpperCase() }}
        </div>
        <div>
          <p class="text-sm font-semibold tracking-[0.16em] text-[var(--blog-ink)]">{{ siteSettings?.siteTitle || 'Blog' }}</p>
          <p class="text-xs text-[var(--blog-subtle)]">
            {{ (siteSettings?.siteDescription || '').slice(0, 30) }}{{ (siteSettings?.siteDescription || '').length > 30 ? '...' : '' }}
          </p>
        </div>
      </NuxtLink>

      <button
        class="blog-toggle flex h-9 w-9 items-center justify-center text-lg transition-transform active:scale-90"
        type="button"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        @click="mobileOpen = !mobileOpen"
      >
        <Transition name="icon-toggle" mode="out-in">
          <span v-if="mobileOpen" key="close" class="text-[22px] leading-none">&times;</span>
          <span v-else key="open" class="flex flex-col gap-[5px]">
            <span class="block h-[2px] w-4 rounded-full bg-[var(--blog-ink)]" />
            <span class="block h-[2px] w-4 rounded-full bg-[var(--blog-ink)]" />
            <span class="block h-[2px] w-4 rounded-full bg-[var(--blog-ink)]" />
          </span>
        </Transition>
      </button>
    </div>

    <Transition name="menu-slide">
      <div v-show="mobileOpen" class="absolute left-0 right-0 top-full overflow-hidden border-t border-[var(--blog-border)] bg-white/95 backdrop-blur-xl px-6 shadow-lg">
        <div class="space-y-1 py-4">
          <TransitionGroup name="menu-item" tag="div" class="space-y-1">
            <NuxtLink
              v-for="(item, index) in navigationItems"
              v-show="mobileOpen"
              :key="item.id"
              :to="item.href"
              :style="{ transitionDelay: `${index * 50}ms` }"
              class="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
              @click="mobileOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
          </TransitionGroup>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.icon-toggle-enter-active,
.icon-toggle-leave-active {
  transition: all 0.2s ease;
}
.icon-toggle-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}
.icon-toggle-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

.menu-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.menu-item-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.menu-item-leave-active {
  transition: all 0.15s ease-in;
}
.menu-item-enter-from {
  opacity: 0;
  transform: translateX(-12px);
}
.menu-item-leave-to {
  opacity: 0;
  transform: translateX(8px);
}
</style>
