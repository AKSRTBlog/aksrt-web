<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

const navigationItems = computed(() =>
  (props.siteSettings?.navigationItems ?? []).filter((item) => item.enabled),
);
</script>

<template>
  <aside class="blog-rail hidden w-[300px] shrink-0 flex-col self-start lg:sticky lg:top-4 lg:flex">
    <div class="border-b border-[var(--blog-border)] px-6 py-6">
      <NuxtLink class="flex items-center gap-3" to="/">
        <AppImage
          v-if="siteSettings?.logoUrl"
          :src="siteSettings.logoUrl"
          :alt="siteSettings.siteTitle"
          class="h-12 w-12 rounded-[1.25rem] object-cover"
          loading="eager"
        />
        <div
          v-else
          class="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-[var(--blog-ink)] text-sm font-semibold text-white"
        >
          {{ (siteSettings?.siteTitle || 'Blog').slice(0, 2).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-[0.18em] text-[var(--blog-ink)]">{{ siteSettings?.siteTitle || 'Blog' }}</p>
        </div>
      </NuxtLink>
    </div>

    <div class="px-5 py-5">
      <div class="space-y-6">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Search</p>
          <div class="mt-3">
            <SearchForm class-name="rounded-[4px] bg-[var(--blog-soft)] px-3 py-2 shadow-none" />
          </div>
        </div>

        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Menu</p>
          <div class="mt-3 space-y-1">
            <NuxtLink
              v-for="item in navigationItems"
              :key="item.id"
              :to="item.href"
              class="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[var(--blog-muted)] transition hover:bg-[var(--blog-soft)] hover:text-[var(--blog-ink)]"
            >
              <span>{{ item.label }}</span>
              <span class="text-[10px] uppercase tracking-[0.22em] opacity-60">Open</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
