<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import { blogAuthor, fetchActivityStats, fetchPublicProjects } from '~/composables/api';

const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

// 纯客户端 AJAX 加载活动统计和项目列表
const activity = ref<unknown>(null);
const projects = ref<unknown[]>([]);
const loading = ref(true);
const error = ref('');

async function loadData() {
  loading.value = true;
  error.value = '';
  try {
    const [activityResult, projectResult] = await Promise.all([
      fetchActivityStats(),
      fetchPublicProjects(),
    ]);
    activity.value = activityResult ?? null;
    projects.value = projectResult ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load data.';
    activity.value = null;
    projects.value = [];
  } finally {
    loading.value = false;
  }
}

usePublicLiveReload(loadData);

onMounted(() => {
  loadData();
});

const aboutDisplayName = computed(() => siteSettings.value?.aboutDisplayName?.trim() || blogAuthor.name);
const aboutBio = computed(() => siteSettings.value?.aboutBio?.trim() || siteSettings.value?.siteDescription || blogAuthor.bio);
const aboutAvatar = computed(() => siteSettings.value?.adminAvatarUrl || blogAuthor.avatar);

function toContactValue(url: string) {
  if (url.startsWith('mailto:')) {
    return url.slice('mailto:'.length);
  }
  if (url.startsWith('tel:')) {
    return url.slice('tel:'.length);
  }
  return url.replace(/^https?:\/\//, '');
}

const contactLinks = computed(() => {
  const contacts = siteSettings.value?.aboutContacts ?? [];

  return contacts
    .map((item) => ({
      id: item.id,
      label: item.name,
      value: toContactValue(item.url),
      href: item.url,
    }))
    .filter((item) => item.label.trim() && item.href.trim());
});

useSeoMeta({
  title: 'About',
  description: () => aboutBio.value,
});
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="space-y-8">
        <!-- 个人信息（始终显示，不依赖 AJAX）-->
        <div class="blog-panel p-8">
          <div class="flex flex-col gap-6 md:flex-row md:items-start">
            <AppImage class="h-24 w-24 rounded-3xl object-cover" :src="aboutAvatar" :alt="aboutDisplayName" loading="eager" />
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">About me</p>
              <h2 class="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--blog-ink)]">{{ aboutDisplayName }}</h2>
              <p class="mt-4 max-w-2xl text-base leading-8 text-[var(--blog-muted)]">{{ aboutBio }}</p>
            </div>
          </div>
        </div>

        <!-- 联系方式（始终显示）-->
        <div class="blog-panel p-6">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Contact</p>
          <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              v-for="item in contactLinks"
              :key="item.id"
              :href="item.href"
              :target="item.href.startsWith('http') ? '_blank' : undefined"
              :rel="item.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              class="block rounded-[4px] border border-[var(--blog-border)] px-4 py-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"
            >
              <p class="text-xs text-[var(--blog-subtle)]">{{ item.label }}</p>
              <p class="mt-1 text-sm font-medium text-[var(--blog-ink)]">{{ item.value }}</p>
            </a>
          </div>
        </div>

        <!-- 活动热力图：AJAX 加载 -->
        <div class="blog-panel p-6">
          <template v-if="loading">
            <div class="flex items-center justify-between mb-5">
              <div class="animate-pulse h-4 w-24 rounded bg-[var(--blog-soft)]" />
              <div class="animate-pulse h-4 w-32 rounded bg-[var(--blog-soft)]" />
            </div>
            <div class="animate-pulse space-y-[3px]" style="padding-left: 28px;">
              <div class="inline-flex gap-[3px]">
                <div v-for="wi in 12" :key="`w-${wi}`" class="flex flex-col gap-[3px]">
                  <div v-for="di in 7" :key="`d-${di}`" class="h-[11px] w-[11px] rounded-sm bg-[var(--blog-soft)] ring-1 ring-black/[0.06]" />
                </div>
              </div>
            </div>
          </template>

          <template v-else-if="!activity && error">
            <div class="flex flex-col items-center gap-3 py-8 text-center">
              <svg class="h-8 w-8 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
              <p class="text-xs text-[var(--blog-subtle)]">{{ error }}</p>
              <button class="blog-button-secondary text-xs" @click="loadData">Retry</button>
            </div>
          </template>

          <ActivityContributionGraph v-else :data="activity as any" />
        </div>

        <!-- 项目展示：AJAX 加载 -->
        <template v-if="loading">
          <div class="blog-panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
            <div v-for="i in 6" :key="i" class="animate-pulse space-y-3 rounded-[4px] border border-[var(--blog-border)] p-5">
              <div class="flex items-start gap-3">
                <div class="h-10 w-10 shrink-0 rounded-xl bg-[var(--blog-soft)]" />
                <div class="min-w-0 flex-1 space-y-2">
                  <div class="h-4 w-3/4 rounded bg-[var(--blog-soft)]" />
                  <div class="h-3 w-full rounded bg-[var(--blog-soft)]" />
                </div>
              </div>
            </div>
          </div>
        </template>
        <ProjectGrid v-else :projects="(projects as any) || []" />

        <!-- 错误提示（仅在非加载且数据为空时显示）-->
        <div v-if="!loading && !error && (!projects || projects.length === 0)" class="blog-panel mt-8 p-8 text-center text-sm text-[var(--blog-subtle)]">
          No data available.
        </div>
      </div>
    </section>
  </div>
</template>
