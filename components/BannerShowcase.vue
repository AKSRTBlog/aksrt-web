<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicBannerItem } from '~/types/blog';
import { formatDate } from '~/composables/api';

const props = defineProps<{
  banners: PublicBannerItem[];
}>();

const featuredBanners = computed(() => props.banners.slice(0, 3));
const hasMultiple = computed(() => featuredBanners.value.length > 1);
const activeIndex = ref(0);

let autoplayTimer: ReturnType<typeof setInterval> | null = null;

const currentBanner = computed(() =>
  featuredBanners.value[activeIndex.value] ?? featuredBanners.value[0] ?? null,
);

function normalizeActiveIndex() {
  if (activeIndex.value >= featuredBanners.value.length) {
    activeIndex.value = 0;
  }
}

function stopAutoplay() {
  if (!autoplayTimer) {
    return;
  }

  clearInterval(autoplayTimer);
  autoplayTimer = null;
}

function nextSlide() {
  if (!featuredBanners.value.length) {
    return;
  }

  activeIndex.value = (activeIndex.value + 1) % featuredBanners.value.length;
}

function startAutoplay() {
  stopAutoplay();

  if (!import.meta.client || !hasMultiple.value) {
    return;
  }

  autoplayTimer = setInterval(nextSlide, 5000);
}

function goTo(index: number) {
  if (index < 0 || index >= featuredBanners.value.length) {
    return;
  }

  activeIndex.value = index;
  startAutoplay();
}

watch(
  () => featuredBanners.value.length,
  () => {
    normalizeActiveIndex();
    startAutoplay();
  },
  { immediate: true },
);

onMounted(() => {
  startAutoplay();
});

onBeforeUnmount(() => {
  stopAutoplay();
});
</script>

<template>
  <div v-if="featuredBanners.length === 1">
    <a
      :href="featuredBanners[0].linkUrl"
      :target="featuredBanners[0].linkTarget"
      :rel="featuredBanners[0].linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
      class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]"
    >
      <AppImage
        :src="featuredBanners[0].imageUrl"
        :alt="featuredBanners[0].title"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        loading="eager"
        fetchpriority="high"
      />
      <div v-if="featuredBanners[0].showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div v-if="featuredBanners[0].showText" class="absolute inset-x-0 bottom-0 p-3 md:p-5">
        <h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">{{ featuredBanners[0].title }}</h2>
        <p v-if="featuredBanners[0].description" class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">{{ featuredBanners[0].description }}</p>
      </div>
    </a>
  </div>

  <template v-else>
    <div class="lg:hidden">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-300"
        leave-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <a
          v-if="currentBanner"
          :key="currentBanner.id"
          :href="currentBanner.linkUrl"
          :target="currentBanner.linkTarget"
          :rel="currentBanner.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
          class="group relative block h-[240px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[280px]"
          @mouseenter="stopAutoplay"
          @mouseleave="startAutoplay"
          @touchstart.passive="stopAutoplay"
          @touchend.passive="startAutoplay"
        >
          <AppImage
            :src="currentBanner.imageUrl"
            :alt="currentBanner.title"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="eager"
            fetchpriority="high"
          />
          <div v-if="currentBanner.showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div v-if="currentBanner.showText" class="absolute inset-x-0 bottom-0 p-3">
            <h2 class="text-base font-semibold leading-tight text-white">{{ currentBanner.title }}</h2>
            <p v-if="currentBanner.description" class="mt-2 line-clamp-2 text-xs text-white/80">{{ currentBanner.description }}</p>
          </div>
        </a>
      </Transition>

      <div class="mt-3 flex items-center justify-center gap-2">
        <button
          v-for="(banner, index) in featuredBanners"
          :key="banner.id"
          type="button"
          :aria-label="`Go to banner ${index + 1}`"
          class="h-2.5 w-2.5 rounded-full transition-all"
          :class="index === activeIndex ? 'w-6 bg-[var(--blog-accent)]' : 'bg-slate-300 hover:bg-slate-400'"
          @click="goTo(index)"
        />
      </div>
    </div>

    <div class="hidden gap-3 lg:grid lg:grid-cols-[minmax(0,2.25fr)_minmax(0,1fr)] lg:items-stretch">
      <a
        v-if="featuredBanners[0]"
        :href="featuredBanners[0].linkUrl"
        :target="featuredBanners[0].linkTarget"
        :rel="featuredBanners[0].linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
        class="group relative block h-[220px] overflow-hidden rounded-[4px] bg-slate-950 sm:h-[250px] md:h-[380px] lg:h-[400px]"
      >
        <AppImage
          :src="featuredBanners[0].imageUrl"
          :alt="featuredBanners[0].title"
          class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="eager"
          fetchpriority="high"
        />
        <div v-if="featuredBanners[0].showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div v-if="featuredBanners[0].showText" class="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          Banner
        </div>
        <div v-if="featuredBanners[0].showText" class="absolute inset-x-0 bottom-0 p-3 md:p-5">
          <h2 class="text-base font-semibold leading-tight text-white md:text-2xl lg:text-[2rem]">{{ featuredBanners[0].title }}</h2>
          <p v-if="featuredBanners[0].description" class="mt-2 max-w-2xl text-xs text-white/80 md:text-base">{{ featuredBanners[0].description }}</p>
          <div class="mt-3 text-xs text-white/80">{{ formatDate(featuredBanners[0].updatedAt) }}</div>
        </div>
      </a>

      <div class="grid gap-3">
        <a
          v-for="banner in featuredBanners.slice(1, 3)"
          :key="banner.id"
          :href="banner.linkUrl"
          :target="banner.linkTarget"
          :rel="banner.linkTarget === '_blank' ? 'noopener noreferrer' : undefined"
          class="group relative block h-[160px] overflow-hidden rounded-[4px] bg-slate-950 md:h-[180px] lg:h-[194px]"
        >
          <AppImage
            :src="banner.imageUrl"
            :alt="banner.title"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            fetchpriority="low"
          />
          <div v-if="banner.showText" class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div v-if="banner.showText" class="absolute inset-x-0 bottom-0 p-3 md:p-4">
            <h2 class="text-sm font-semibold leading-snug text-white md:text-lg">{{ banner.title }}</h2>
            <p v-if="banner.description" class="mt-2 line-clamp-1 text-[11px] text-white/80 md:text-sm">{{ banner.description }}</p>
          </div>
        </a>
      </div>
    </div>
  </template>
</template>
