<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { BlogComment } from '~/types/blog';

defineProps<{
  comments: BlogComment[];
}>();

function formatCommentClient(comment: BlogComment) {
  const parts = [comment.browserLabel || 'Unknown browser'];
  if (comment.osLabel && comment.osLabel !== 'Unknown OS') {
    parts.push(comment.osLabel);
  }

  return parts.join(' · ');
}
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
          <div class="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-[var(--blog-subtle)]">
            <span
              class="rounded-full border border-[var(--blog-border)] bg-[var(--blog-soft)] px-2 py-0.5"
              :title="comment.userAgent || formatCommentClient(comment)"
            >
              {{ formatCommentClient(comment) }}
            </span>
            <span class="rounded-full border border-[var(--blog-border)] bg-[var(--blog-soft)] px-2 py-0.5">
              IP {{ comment.ip || 'unknown' }}
            </span>
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
