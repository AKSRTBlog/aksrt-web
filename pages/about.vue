<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import { blogAuthor, fetchActivityStats, fetchPublicProjects, fetchPublicSiteSettings } from '~/composables/api';

const { data: siteSettings } = await useAsyncData('site-settings', fetchPublicSiteSettings);

const [{ data: activity }, { data: projects }] = await Promise.all([
  useAsyncData('about-activity', fetchActivityStats),
  useAsyncData('about-projects', fetchPublicProjects),
]);

const aboutDisplayName = computed(() => siteSettings.value?.aboutDisplayName?.trim() || blogAuthor.name);
const aboutBio = computed(() => siteSettings.value?.aboutBio?.trim() || siteSettings.value?.siteDescription || blogAuthor.bio);
const aboutAvatar = computed(() => siteSettings.value?.adminAvatarUrl || blogAuthor.avatar);

const contactLinks = computed(() => {
  const githubUsername = siteSettings.value?.githubUsername;

  return [
    { label: 'Email', value: 'kate522@88.com', href: 'mailto:kate522@88.com' },
    {
      label: 'GitHub',
      value: githubUsername ? `github.com/${githubUsername}` : 'github.com/Lexo0522',
      href: githubUsername ? `https://github.com/${githubUsername}` : 'https://github.com/Lexo0522',
    },
    { label: 'QQ', value: '850024520', href: 'https://wpa.qq.com/msgrd?v=3&uin=850024520&site=qq&menu=yes' },
  ];
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

        <div class="blog-panel p-6">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Contact</p>
          <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <a
              v-for="item in contactLinks"
              :key="item.label"
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

        <ActivityContributionGraph :data="activity" />
        <ProjectGrid :projects="projects || []" />
      </div>
    </section>
  </div>
</template>
