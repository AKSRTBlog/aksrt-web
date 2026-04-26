<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

const navigationItems = computed(() =>
  (props.siteSettings?.navigationItems ?? []).filter((item) => item.enabled),
);

/**
 * 将数据库存储的图标名统一转换为 Nuxt Icon 可用的格式
 * 支持：
 *   fa6-solid-home        → 原样返回
 *   lucide:home          → 原样返回
 *   fa-solid fa-circle-user → fa6-solid-circle-user
 *   fa-brands github     → fa6-brands-github
 *   house                 → lucide:house
 */
function resolveNavigationIcon(iconName?: string | null) {
  const raw = iconName?.trim();
  if (!raw) return '';

  // 已是 Nuxt Icon 格式，直接返回
  if (raw.startsWith('fa6-') || raw.includes(':')) return raw;

  // 传统 FA 多段式：fa-solid fa-circle-user → 拆成多段再合并
  if (raw.startsWith('fa-')) {
    const parts = raw.split(/\s+/);
    const cleaned = parts.map(p => p.replace(/^fa-/, ''));
    return `fa6-${cleaned.join('-').toLowerCase()}`;
  }

  // 纯名称 → 当作 lucide 图标
  return `lucide:${raw.toLowerCase()}`;
}
</script>

<template>
  <aside
    class="
      blog-sidebar
      hidden w-[280px] shrink-0 flex-col
      rounded-2xl shadow-[0_4px_24px_rgba(15,23,42,0.08)]
      bg-white
      lg:sticky lg:top-4 lg:flex
      overflow-hidden
    "
  >
    <!-- ========== Logo + 站点信息 ========== -->
    <div class="relative border-b border-[var(--blog-border)] bg-gradient-to-b from-[var(--blog-soft)] to-white px-6 py-6">
      <!-- 装饰圆点 -->
      <div class="absolute top-4 right-6 flex gap-1.5 opacity-40">
        <div class="h-2 w-2 rounded-full bg-[var(--blog-accent)]/40"></div>
        <div class="h-2 w-2 rounded-full bg-[var(--blog-accent)]/25"></div>
        <div class="h-2 w-2 rounded-full bg-[var(--blog-accent)]/10"></div>
      </div>

      <NuxtLink class="group flex items-center gap-3.5" to="/">
        <!-- Logo -->
        <div class="shrink-0">
          <AppImage
            v-if="siteSettings?.logoUrl"
            :src="siteSettings.logoUrl"
            :alt="siteSettings.siteTitle"
            class="h-12 w-12 rounded-xl object-cover ring-2 ring-white shadow-sm transition group-hover:ring-[var(--blog-accent)]/30"
            loading="eager"
          />
          <div
            v-else
            class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--blog-ink)] to-[var(--blog-ink)]/80 text-base font-black text-white shadow-sm"
          >
            {{ (siteSettings?.siteTitle).slice(0, 2).toUpperCase() }}
          </div>
        </div>

        <!-- 站点名 -->
        <div class="min-w-0">
          <p class="truncate text-[15px] font-black leading-tight tracking-tight text-[var(--blog-ink)]">
            {{ siteSettings?.siteTitle}}
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- ========== 主体内容（可滚动）========== -->
    <div class="flex-1 space-y-6 overflow-y-auto px-4 py-5">
      <!-- 搜索框 -->
      <div class="group">
        <SearchForm
          class="
            rounded-xl
            bg-[#f8f9fc]
            border border-[var(--blog-border)]/50
            px-3.5 py-2.5
            shadow-sm
            transition-shadow
            group-hover:shadow-md
          "
        />
      </div>

      <!-- 导航菜单 -->
      <nav class="space-y-0.5">
        <NuxtLink
          v-for="item in navigationItems"
          :key="item.id"
          :to="item.href"
          exact
          exact-active-class="
            bg-[var(--blog-accent)]/8
            text-[var(--blog-accent)]
            font-bold
            shadow-sm
          "
          class="
            flex items-center gap-3
            rounded-xl px-3.5 py-2.5
            text-sm text-[var(--blog-muted)]
            transition-all duration-200
            hover:bg-[var(--blog-soft)]
            hover:text-[var(--blog-ink)]
            hover:shadow-sm
          "
        >
          <!-- 图标 -->
          <span
            class="
              flex h-[34px] w-[34px] shrink-0
              items-center justify-center
              rounded-lg
              bg-[var(--blog-soft)]
              text-[var(--blog-muted)]
              transition-all duration-200
            "
            :class="{
              '!bg-[var(--blog-accent)]/12 !text-[var(--blog-accent)]': $route.path === item.href,
            }"
            aria-hidden="true"
          >
            <Icon
              v-if="resolveNavigationIcon(item.iconUrl)"
              :name="resolveNavigationIcon(item.iconUrl)"
              class="h-[18px] w-[18px]"
            />
            <Icon
              v-else
              name="lucide:file-text"
              class="h-[18px] w-[18px] opacity-40"
            />
          </span>
          <!-- 标签文字 -->
          <span class="truncate">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- 分类 & 标签 -->
      <SiteSidebarTaxonomy />
    </div>
  </aside>
</template>
