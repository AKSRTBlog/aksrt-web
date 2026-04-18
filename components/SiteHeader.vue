<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

const mobileOpen = ref(false);

// 路由变化时自动关闭菜单
watch(() => useRoute().fullPath, () => {
  if (mobileOpen.value) {
    mobileOpen.value = false;
  }
});

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
  </header>

  <!-- 菜单通过 Teleport 挂载到 body，完全独立于页面布局 -->
  <Teleport to="body">
    <Transition name="menu-overlay">
      <div
        v-if="mobileOpen"
        class="fixed inset-x-0 top-0 z-[60] pt-[72px]"
        @click.self="mobileOpen = false"
      >
        <!-- 遮罩层 -->
        <Transition name="mask-fade">
          <div v-if="mobileOpen" class="fixed inset-0 -top-[72px] bg-black/20 backdrop-blur-sm" />
        </Transition>

        <!-- 菜单内容 -->
        <nav class="relative z-10 border-t border-[var(--blog-border)] bg-white/95 px-6 py-5 shadow-lg backdrop-blur-xl">
          <div class="space-y-1">
            <NuxtLink
              v-for="(item, index) in navigationItems"
              :key="item.id"
              :to="item.href"
              class="animate-menu-item block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
              :style="{ animationDelay: `${80 + index * 50}ms` }"
              @click="mobileOpen = false"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </nav>
      </div>
    </Transition>
  </Teleport>
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

.menu-overlay-enter-active {
  transition: all 0.25s ease-out;
}
.menu-overlay-leave-active {
  transition: all 0.2s ease-in;
}
.menu-overlay-enter-from,
.menu-overlay-leave-to {
  opacity: 0;
}

.mask-fade-enter-active {
  transition: opacity 0.25s ease-out;
}
.mask-fade-leave-active {
  transition: opacity 0.15s ease-in;
}
.mask-fade-enter-from,
.mask-fade-leave-to {
  opacity: 0;
}

@keyframes menu-item-in {
  from {
    opacity: 0;
    transform: translateX(-12px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-menu-item {
  opacity: 0;
  animation: menu-item-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
