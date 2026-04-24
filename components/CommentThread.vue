<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import type { BlogComment } from '~/types/blog';

const props = withDefaults(defineProps<{
  comments: BlogComment[];
  depth?: number;
}>(), {
  depth: 0,
});

function formatCommentClient(comment: BlogComment) {
  const parts = [comment.browserLabel || 'Unknown browser'];
  if (comment.osLabel && comment.osLabel !== 'Unknown OS') {
    parts.push(comment.osLabel);
  }

  return parts.join(' / ');
}

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<template>
  <div class="space-y-4">
    <article
      v-for="comment in comments"
      :key="comment.id"
      :class="props.depth === 0 ? 'comment-card' : 'comment-reply'"
    >
      <div class="flex gap-3 sm:gap-4">
        <AppImage
          class="h-11 w-11 shrink-0 rounded-full border border-[var(--blog-border)] bg-white object-cover"
          :src="comment.avatarUrl"
          :alt="comment.nickname"
        />
        <div class="min-w-0 flex-1">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <h3 class="truncate text-sm font-semibold text-[var(--blog-ink)]">{{ comment.nickname }}</h3>
              <p class="mt-0.5 text-xs text-[var(--blog-subtle)]">{{ formatCommentDate(comment.createdAt) }}</p>
            </div>

            <div class="flex shrink-0 flex-wrap gap-2 text-[11px] text-[var(--blog-subtle)]">
              <span
                class="comment-chip max-w-full"
                :title="comment.userAgent || formatCommentClient(comment)"
              >
                {{ formatCommentClient(comment) }}
              </span>
              <span class="comment-chip">IP {{ comment.ip || 'unknown' }}</span>
            </div>
          </div>

          <p class="mt-3 whitespace-pre-wrap break-words text-[0.94rem] leading-7 text-[var(--blog-muted)]">
            {{ comment.content }}
          </p>
        </div>
      </div>

      <div v-if="comment.replies.length > 0" class="comment-replies">
        <CommentThread :comments="comment.replies" :depth="props.depth + 1" />
      </div>
    </article>
  </div>
</template>

<style scoped>
.comment-card {
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem;
  box-shadow: 0 14px 34px rgba(38, 31, 27, 0.06);
}

.comment-reply {
  padding: 0.25rem 0 0.25rem 1rem;
  border-left: 1px solid var(--blog-border);
}

.comment-replies {
  margin-top: 1rem;
  margin-left: 1.35rem;
  padding-left: 1.15rem;
  border-left: 1px solid var(--blog-border);
}

.comment-chip {
  display: inline-flex;
  min-height: 1.55rem;
  max-width: 16rem;
  align-items: center;
  border: 1px solid var(--blog-border);
  border-radius: 999px;
  background: var(--blog-soft);
  padding: 0.15rem 0.55rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .comment-card {
    padding: 0.9rem;
  }

  .comment-replies {
    margin-left: 0.75rem;
    padding-left: 0.85rem;
  }

  .comment-reply {
    padding-left: 0.75rem;
  }
}
</style>
