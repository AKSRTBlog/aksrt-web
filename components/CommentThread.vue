<script setup lang="ts">
import { computed, ref } from 'vue';
import AppImage from '~/components/AppImage.vue';
import type { BlogComment } from '~/types/blog';

const props = withDefaults(defineProps<{
  comments: BlogComment[];
  depth?: number;
  parentNickname?: string | null;
  activeReplyId?: string | null;
  highlightedCommentId?: string | null;
  pendingCommentId?: string | null;
}>(), {
  depth: 0,
  parentNickname: null,
  activeReplyId: null,
  highlightedCommentId: null,
  pendingCommentId: null,
});

const emit = defineEmits<{
  reply: [commentId: string];
}>();

const COLLAPSE_THRESHOLD = 500;
const MAX_VISUAL_DEPTH = 4;

const visualDepth = computed(() => Math.min(props.depth, MAX_VISUAL_DEPTH));
const expandedComments = ref<string[]>([]);

function formatCommentDate(date: string) {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function shouldCollapse(content: string) {
  return content.length > COLLAPSE_THRESHOLD;
}

function isExpanded(id: string) {
  return expandedComments.value.includes(id);
}

function toggleExpand(id: string) {
  const index = expandedComments.value.indexOf(id);
  if (index > -1) {
    expandedComments.value.splice(index, 1);
    return;
  }

  expandedComments.value.push(id);
}

function replyCount(comment: BlogComment): number {
  return comment.replies.reduce((total, reply) => total + 1 + replyCount(reply), 0);
}
</script>

<template>
  <div class="comment-thread">
    <article
      v-for="comment in comments"
      :id="`comment-${comment.id}`"
      :key="comment.id"
      class="comment-node"
      :class="{
        'comment-node-root': props.depth === 0,
        'comment-node-reply': props.depth > 0,
        'comment-node-active-reply': props.activeReplyId === comment.id,
        'comment-node-highlight': props.highlightedCommentId === comment.id,
        'comment-node-pending': props.pendingCommentId === comment.id,
      }"
      :style="{ '--comment-depth': visualDepth }"
    >
      <span v-if="props.pendingCommentId === comment.id" class="comment-pending-badge">
        <Icon name="lucide:loader-2" aria-hidden="true" />
        提交中
      </span>

      <div class="comment-body">
        <div class="comment-avatar-wrap">
          <AppImage
            class="comment-avatar"
            :src="comment.avatarUrl"
            :alt="comment.nickname"
          />
        </div>

        <div class="comment-main">
          <header class="comment-header">
            <div class="comment-author-line">
              <h3 class="comment-author">{{ comment.nickname }}</h3>
              <span v-if="props.depth > 0 && parentNickname" class="comment-reply-context">
                <Icon name="lucide:corner-down-right" aria-hidden="true" />
                回复 {{ parentNickname }}
              </span>
            </div>

            <time class="comment-time" :datetime="comment.createdAt">
              {{ formatCommentDate(comment.createdAt) }}
            </time>
          </header>

          <div v-if="props.depth === 0" class="comment-meta-row">
            <CommentMeta
              :browser-label="comment.browserLabel"
              :os-label="comment.osLabel"
              :user-agent="comment.userAgent"
              :country-name="comment.countryName"
              :compact="true"
            />
          </div>

          <div class="comment-content">
            <p
              v-if="!shouldCollapse(comment.content) || isExpanded(comment.id)"
              class="comment-text"
            >
              {{ comment.content }}
            </p>

            <template v-else>
              <p class="comment-text comment-text-collapsed">
                {{ comment.content.slice(0, COLLAPSE_THRESHOLD) }}...
              </p>
              <button
                class="comment-action comment-expand"
                type="button"
                @click="toggleExpand(comment.id)"
              >
                <Icon name="lucide:chevrons-down" aria-hidden="true" />
                展开全文（{{ comment.content.length }} 字）
              </button>
            </template>
          </div>

          <footer class="comment-footer">
            <button
              class="comment-action"
              :class="{ 'comment-action-active': props.activeReplyId === comment.id }"
              type="button"
              @click="emit('reply', comment.id)"
            >
              <Icon name="lucide:reply" aria-hidden="true" />
              {{ props.activeReplyId === comment.id ? '正在回复' : '回复' }}
            </button>

            <span v-if="comment.replies.length > 0" class="comment-reply-count">
              <Icon name="lucide:message-square" aria-hidden="true" />
              {{ replyCount(comment) }} 条回复
            </span>
          </footer>
        </div>
      </div>

      <div v-if="comment.replies.length > 0" class="comment-replies">
        <CommentThread
          :comments="comment.replies"
          :depth="props.depth + 1"
          :parent-nickname="comment.nickname"
          :active-reply-id="props.activeReplyId"
          :highlighted-comment-id="props.highlightedCommentId"
          :pending-comment-id="props.pendingCommentId"
          @reply="emit('reply', $event)"
        />
      </div>
    </article>
  </div>
</template>

<style scoped>
.comment-thread {
  display: grid;
  gap: 1rem;
}

.comment-node {
  position: relative;
  min-width: 0;
  border-radius: 8px;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.comment-node-root {
  border: 1px solid var(--blog-border);
  background: rgba(255, 255, 255, 0.96);
  padding: 1rem;
  box-shadow: 0 10px 30px -26px rgba(25, 29, 36, 0.45);
}

.comment-node-root:hover {
  border-color: var(--blog-border-strong);
  box-shadow: 0 16px 36px -30px rgba(25, 29, 36, 0.55);
}

.comment-node-reply {
  background: color-mix(in srgb, var(--blog-soft) 72%, #ffffff);
  padding: 0.9rem 0.9rem 0.9rem 1rem;
}

.comment-node-active-reply {
  background: color-mix(in srgb, var(--blog-accent) 8%, #ffffff);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--blog-accent) 34%, transparent);
}

.comment-node-highlight {
  animation: comment-highlight 2.2s ease forwards;
}

.comment-node-pending {
  border-style: dashed;
  border-color: color-mix(in srgb, #f59e0b 58%, var(--blog-border));
  background: color-mix(in srgb, #fffbeb 72%, #ffffff);
}

.comment-pending-badge {
  position: absolute;
  right: 0.65rem;
  top: -0.6rem;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid #fde68a;
  border-radius: 999px;
  background: #fffbeb;
  color: #b45309;
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
  padding: 0.25rem 0.5rem;
}

.comment-pending-badge :deep(svg) {
  width: 0.75rem;
  height: 0.75rem;
  animation: comment-spin 0.8s linear infinite;
}

.comment-body {
  display: flex;
  min-width: 0;
  gap: 0.85rem;
}

.comment-avatar-wrap {
  flex: 0 0 auto;
}

.comment-avatar {
  width: clamp(2rem, 1.8rem + 0.8vw, 2.75rem);
  height: clamp(2rem, 1.8rem + 0.8vw, 2.75rem);
  border: 1px solid var(--blog-border);
  border-radius: 999px;
  background: #ffffff;
  object-fit: cover;
}

.comment-main {
  min-width: 0;
  flex: 1;
}

.comment-header {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.comment-author-line {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.comment-author {
  max-width: min(18rem, 100%);
  overflow: hidden;
  color: var(--blog-ink);
  font-size: 0.9rem;
  font-weight: 750;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-reply-context,
.comment-reply-count,
.comment-action {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.comment-reply-context {
  max-width: 12rem;
  overflow: hidden;
  color: var(--blog-subtle);
  font-size: 0.72rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-reply-context :deep(svg),
.comment-reply-count :deep(svg),
.comment-action :deep(svg) {
  width: 0.85rem;
  height: 0.85rem;
  flex: 0 0 auto;
}

.comment-time {
  flex: 0 0 auto;
  color: var(--blog-subtle);
  font-size: 0.72rem;
  line-height: 1.25;
  white-space: nowrap;
}

.comment-meta-row {
  margin-top: 0.45rem;
  opacity: 0.68;
  transition: opacity 0.2s ease;
}

.comment-node-root:hover .comment-meta-row {
  opacity: 1;
}

.comment-content {
  margin-top: 0.65rem;
}

.comment-text {
  color: color-mix(in srgb, var(--blog-ink) 88%, #475569);
  font-size: 0.94rem;
  line-height: 1.78;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.comment-text-collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 7;
}

.comment-footer {
  margin-top: 0.7rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.comment-action {
  border: 0;
  background: transparent;
  color: var(--blog-subtle);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 650;
  line-height: 1;
  padding: 0.15rem 0;
  transition: color 0.2s ease;
}

.comment-action:hover,
.comment-action-active {
  color: var(--blog-accent);
}

.comment-expand {
  margin-top: 0.45rem;
}

.comment-reply-count {
  color: var(--blog-subtle);
  font-size: 0.72rem;
  line-height: 1;
}

.comment-replies {
  position: relative;
  margin-top: 0.9rem;
  margin-left: calc(1.35rem + (var(--comment-depth) * 0.35rem));
  padding-left: 1rem;
}

.comment-replies::before {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  content: "";
  width: 2px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--blog-accent) 38%, var(--blog-border)),
    color-mix(in srgb, var(--blog-border) 64%, transparent)
  );
  border-radius: 1px;
}

@media (max-width: 640px) {
  .comment-node-root {
    padding: 0.9rem;
  }

  .comment-node-reply {
    padding: 0.8rem 0.75rem;
  }

  .comment-body {
    gap: 0.65rem;
  }

  .comment-header {
    flex-direction: column;
    gap: 0.2rem;
  }

  .comment-replies {
    margin-left: 0.5rem;
    padding-left: 0.7rem;
  }

  .comment-author {
    max-width: 13rem;
  }
}

:deep(.comment-meta-chip) {
  color: #64748b;
}

@keyframes comment-highlight {
  0% {
    background-color: color-mix(in srgb, var(--blog-accent) 18%, #ffffff);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--blog-accent) 14%, transparent);
  }

  100% {
    box-shadow: none;
  }
}

@keyframes comment-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
