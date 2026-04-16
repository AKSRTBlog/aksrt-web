<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { PublicProjectItem } from '~/types/blog';

defineProps<{
  projects: PublicProjectItem[];
}>();
</script>

<template>
  <div v-if="projects.length > 0" class="blog-panel p-6">
    <p class="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blog-subtle)]">Projects</p>
    <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <a
        v-for="project in projects"
        :key="project.id"
        :href="project.link"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-start gap-4 rounded-lg border border-[var(--blog-border)] p-4 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"
      >
        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[var(--blog-soft)] text-[var(--blog-accent)]">
          <AppImage v-if="project.icon" :src="project.icon" :alt="project.title" class="h-8 w-8 rounded object-cover" />
          <span v-else class="text-lg font-semibold">P</span>
        </div>
        <div class="min-w-0 flex-1">
          <h3 class="text-sm font-semibold text-[var(--blog-ink)] group-hover:text-[var(--blog-accent)]">{{ project.title }}</h3>
          <p class="mt-1 line-clamp-2 text-xs leading-5 text-[var(--blog-muted)]">{{ project.description }}</p>
        </div>
      </a>
    </div>
  </div>
</template>
