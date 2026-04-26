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

function resolveNavigationIcon(iconName?: string | null) {
  const value = iconName?.trim();
  return value && value.startsWith('fa6-') ? value : '';
}

// 路由变化时自动关闭菜单
watch(() => useRoute().fullPath, () => {
  if (mobileOpen.value) {
    mobileOpen.value = false;
  }
});
</script>

<template>
  <header class="relative z-50 border-b border-[var(--blog-border)] bg-[rgba(255,255,255,0.9)] backdrop-blur-xl lg:hidden">
    <!-- 导航栏区域 -->
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

    <!-- 菜单容器 - 绝对定位在导航栏下方，属于 header 一部分 -->
    <Transition name="menu-slide">
      <nav
        v-show="mobileOpen"
        class="absolute left-0 right-0 top-full max-h-[calc(100vh-76px)] overflow-y-auto border-t border-[var(--blog-border)] bg-white/95 px-6 py-4 shadow-lg backdrop-blur-xl"
      >
        <div class="space-y-1">
          <NuxtLink
            v-for="(item, index) in navigationItems"
            :key="item.id"
            :to="item.href"
            class="animate-menu-item flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
            :style="{ animationDelay: `${80 + index * 50}ms` }"
            @click="mobileOpen = false"
          >
            <Icon v-if="resolveNavigationIcon(item.iconUrl)" :name="resolveNavigationIcon(item.iconUrl)" class="h-4 w-4 shrink-0 text-[var(--blog-accent)]" />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>

        <div class="mt-5 border-t border-[var(--blog-border)] pt-5">
          <SiteSidebarTaxonomy />
        </div>
      </nav>
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
  transition: all 0.25s ease-in;
}
.menu-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
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
