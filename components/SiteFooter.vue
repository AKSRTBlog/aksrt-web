<script setup lang="ts">
import type { PublicSiteSettingsItem } from '~/types/blog';

const props = defineProps<{
  siteSettings?: PublicSiteSettingsItem;
}>();

type DisplayLinkItem = {
  id: string;
  label: string;
  href: string;
  external: boolean;
};

function toSafeString(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  return String(value);
}

function isExternal(href: unknown) {
  return typeof href === 'string' && (/^https?:\/\//i.test(href) || href.startsWith('//'));
}

function normalizeLinkItem(
  item: { id: string; label: string; href: string; enabled: boolean } | undefined,
  index: number,
): DisplayLinkItem | null {
  if (!item?.enabled) {
    return null;
  }

  const href = toSafeString(item.href).trim();
  if (!href) {
    return null;
  }

  const label = toSafeString(item.label).trim() || href;

  return {
    id: toSafeString(item.id) || `footer-link-${index}`,
    label,
    href,
    external: isExternal(href),
  };
}

const displayedNavigationItems = computed(() => {
  return (props.siteSettings?.navigationItems ?? [])
    .map((item, index) => normalizeLinkItem(item, index))
    .filter((item): item is DisplayLinkItem => item !== null)
    .slice(0, 6);
});

const displayedLinks = computed(() => {
  return (props.siteSettings?.footerLinks ?? [])
    .map((item, index) => normalizeLinkItem(item, index))
    .filter((item): item is DisplayLinkItem => item !== null)
    .slice(0, 6);
});
</script>

<template>
  <footer class="border-t border-[var(--blog-border)] bg-white/85 backdrop-blur">
    <div class="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[minmax(0,1.4fr)_0.8fr]">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">{{ siteSettings?.siteTitle || 'Blog' }}</p>
        <p class="mt-4 max-w-lg text-sm leading-7 text-[var(--blog-muted)]">{{ siteSettings?.siteDescription }}</p>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Menu</p>
        <div class="mt-4 space-y-3">
          <template v-for="item in displayedNavigationItems" :key="item.id">
            <a
              v-if="item.external"
              :href="item.href"
              rel="noopener noreferrer"
              target="_blank"
              class="block text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
            >
              {{ item.label }}
            </a>
            <NuxtLink
              v-else
              :to="item.href"
              class="block text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </div>
      </div>

      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--blog-subtle)]">Links</p>
        <div class="mt-4 flex flex-wrap gap-x-4 gap-y-3">
          <template v-for="item in displayedLinks" :key="item.id">
            <a
              v-if="item.external"
              :href="item.href"
              rel="noopener noreferrer"
              target="_blank"
              class="text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
            >
              {{ item.label }}
            </a>
            <NuxtLink
              v-else
              :to="item.href"
              class="text-sm text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
            >
              {{ item.label }}
            </NuxtLink>
          </template>
        </div>
      </div>
    </div>

    <div v-if="siteSettings?.showFiling && (siteSettings.icpFiling || siteSettings.policeFiling)" class="border-t border-[var(--blog-border)] bg-white/50 px-6 py-4">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4 text-xs text-[var(--blog-subtle)]">
        <a
          v-if="siteSettings.icpFiling"
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          class="transition hover:text-[var(--blog-ink)]"
        >
          {{ siteSettings.icpFiling }}
        </a>
        <span v-if="siteSettings.icpFiling && siteSettings.policeFiling" class="text-[var(--blog-border)]">|</span>
        <span v-if="siteSettings.policeFiling">{{ siteSettings.policeFiling }}</span>
      </div>
    </div>

    <div v-if="siteSettings?.customFooterCode" v-html="siteSettings.customFooterCode" />

    <div class="border-t border-[var(--blog-border)] bg-white/70 px-6 py-5">
      <p class="text-center text-xs text-[var(--blog-subtle)]">
        &copy; {{ new Date().getFullYear() }} {{ siteSettings?.siteTitle || 'Blog' }}.
        Powered by
        <a
          href="https://github.com/AKSRTBlog"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-[var(--blog-ink)] transition hover:text-[var(--blog-accent)]"
        >AKSRT</a>
      </p>
    </div>
  </footer>
</template>
