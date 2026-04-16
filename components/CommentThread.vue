<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { BlogComment } from '~/types/blog';

defineProps<{
  comments: BlogComment[];
}>();
</script>

<template>
  <div class="space-y-6">
    <div v-for="comment in comments" :key="comment.id" class="border-l border-[var(--blog-border)] pl-5">
      <div class="flex gap-4">
        <AppImage class="h-10 w-10 rounded-full object-cover" :src="comment.avatarUrl" :alt="comment.nickname" />
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-semibold text-[var(--blog-ink)]">{{ comment.nickname }}</span>
            <span class="text-xs text-[var(--blog-subtle)]">{{ new Date(comment.createdAt).toLocaleDateString('zh-CN') }}</span>
          </div>
          <p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]">{{ comment.content }}</p>
        </div>
      </div>

      <div v-if="comment.replies.length > 0" class="mt-4 space-y-4">
        <CommentThread :comments="comment.replies" />
      </div>
    </div>
  </div>
</template>
