<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicBannerItem } from '~/types/blog';
import { formatDate } from '~/composables/api';

defineProps<{
  banners: PublicBannerItem[];
}>();
</script>

<template>
  <div v-if="banners.length === 1">
    <a
      :href="banners[0].linkUrl"
      :target="banners[0].linkTarget"
      :rel="banners[0].linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
      class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]"
    >
      <AppImage :src="banners[0].imageUrl" :alt="banners[0].title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="eager" fetchpriority="high" />
      <div v-if="banners[0].showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div v-if="banners[0].showText" class="absolute inset-x-0 bottom-0 p-3 md:p-5">
        <h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">{{ banners[0].title }}</h2>
        <p v-if="banners[0].description" class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">{{ banners[0].description }}</p>
      </div>
    </a>
  </div>

  <div v-else class="grid gap-3 lg:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)] lg:items-stretch">
    <a
      v-if="banners[0]"
      :href="banners[0].linkUrl"
      :target="banners[0].linkTarget"
      :rel="banners[0].linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
      class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]"
    >
      <AppImage :src="banners[0].imageUrl" :alt="banners[0].title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="eager" fetchpriority="high" />
      <div v-if="banners[0].showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div v-if="banners[0].showText" class="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        Banner
      </div>
      <div v-if="banners[0].showText" class="absolute inset-x-0 bottom-0 p-3 md:p-5">
        <h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">{{ banners[0].title }}</h2>
        <p v-if="banners[0].description" class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">{{ banners[0].description }}</p>
        <div class="mt-3 text-xs text-white/80">{{ formatDate(banners[0].updatedAt) }}</div>
      </div>
    </a>

    <div class="grid gap-3">
      <a
        v-for="banner in banners.slice(1, 3)"
        :key="banner.id"
        :href="banner.linkUrl"
        :target="banner.linkTarget"
        :rel="banner.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
        class="group relative block h-[160px] overflow-hidden rounded-[4px] bg-slate-950 md:h-[180px] lg:h-[194px]"
      >
        <AppImage :src="banner.imageUrl" :alt="banner.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div v-if="banner.showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div v-if="banner.showText" class="absolute inset-x-0 bottom-0 p-3 md:p-4">
          <h2 class="text-sm font-semibold leading-snug text-white md:text-lg">{{ banner.title }}</h2>
          <p v-if="banner.description" class="mt-2 line-clamp-1 text-[11px] text-white/80 md:text-sm">{{ banner.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>
