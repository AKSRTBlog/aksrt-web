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
        class="blog-toggle"
        type="button"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        @click="mobileOpen = !mobileOpen"
      >
        {{ mobileOpen ? 'x' : '=' }}
      </button>
    </div>

    <div v-if="mobileOpen" class="border-t border-[var(--blog-border)] bg-white/95 px-6 py-4">
      <div class="space-y-2">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.href"
          class="block rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
          @click="mobileOpen = false"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </div>
  </header>
</template>
