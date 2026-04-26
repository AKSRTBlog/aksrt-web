<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

const navigationItems = computed(() =>
  (props.siteSettings?.navigationItems ?? []).filter((item) => item.enabled),
);

function resolveNavigationIcon(iconName?: string | null) {
  const value = iconName?.trim();
  if (!value) return '';

  // 已是 Nuxt Icon 格式（fa6-xxx 或 lucide:xxx 等），直接返回
  if (value.startsWith('fa6-') || value.includes(':')) return value;

  // 传统 FA 格式：fa-solid house / fa-regular envelope / fa-brands github
  const faMatch = value.match(/^fa-(solid|regular|brands|duotone|light|thin)\s+(.+)$/i);
  if (faMatch) {
    return `fa6-${faMatch[1].toLowerCase()}-${faMatch[2].trim().toLowerCase().replace(/\s+/g, '-')}`;
  }

  // 纯名称，尝试作为 lucide 图标
  return `lucide:${value.toLowerCase()}`;
}
</script>

<template>
  <aside class="blog-rail hidden w-[280px] shrink-0 flex-col self-start rounded-2xl shadow-lg lg:sticky lg:top-4 lg:flex">
    <!-- Logo + 站点信息 -->
    <div class="border-b border-[var(--blog-border)] bg-[var(--blog-soft)] px-5 py-5">
      <NuxtLink class="flex items-center gap-3" to="/">
        <AppImage
          v-if="siteSettings?.logoUrl"
          :src="siteSettings.logoUrl"
          :alt="siteSettings.siteTitle"
          class="h-11 w-11 shrink-0 rounded-xl object-cover"
          loading="eager"
        />
        <div
          v-else
          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--blog-ink)] text-base font-bold text-white"
        >
          {{ (siteSettings?.siteTitle || 'Blog').slice(0, 1).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[15px] font-semibold leading-tight text-[var(--blog-ink)]">{{ siteSettings?.siteTitle || 'Blog' }}</p>
        </div>
      </NuxtLink>
    </div>

    <div class="px-4 py-5 space-y-7">
      <!-- 搜索 -->
      <div>
        <SearchForm class-name="rounded-xl bg-[var(--blog-soft)] px-3.5 py-2.5 shadow-none text-sm" />
      </div>

      <!-- 导航菜单 -->
      <nav class="space-y-0.5">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.href"
          exact
          active-class="bg-blue-50 text-blue-600 font-semibold"
          class="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-[var(--blog-muted)] transition-colors hover:bg-blue-50 hover:text-blue-600"
        >
          <span
            v-if="resolveNavigationIcon(item.iconUrl)"
            class="flex h-[18px] w-[18px] shrink-0 items-center justify-center"
            aria-hidden="true"
          >
            <Icon :name="resolveNavigationIcon(item.iconUrl)" class="h-[18px] w-[18px]" />
          </span>
          <Icon v-else name="lucide:file-text" class="h-[18px] w-[18px] shrink-0 opacity-40" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 分类 & 标签 -->
      <SiteSidebarTaxonomy />
    </div>
  </aside>
</template>
