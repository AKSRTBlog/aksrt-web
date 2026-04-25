<script setup lang="ts">
import { ref } from 'vue';
import AppImage from '~/components/AppImage.vue';
import type { BlogComment } from '~/types/blog';

const props = withDefaults(defineProps<{
  comments: BlogComment[];
  depth?: number;
}>(), {
  depth: 0,
});

const emit = defineEmits<{
  reply: [commentId: string];
}>();

const COLLAPSE_THRESHOLD = 500;

function formatCommentDate(date: string) {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// 处理长评论折叠
function shouldCollapse(content: string) {
  return content.length > COLLAPSE_THRESHOLD;
}

// 展开状态管理
const expandedComments = ref<string[]>([]);

function toggleExpand(id: string) {
  const index = expandedComments.value.indexOf(id);
  if (index > -1) {
    expandedComments.value.splice(index, 1);
  } else {
    expandedComments.value.push(id);
  }
}
</script>

<template>
  <div class="space-y-5">
    <article
      v-for="comment in comments"
      :key="comment.id"
      :class="props.depth === 0 ? 'comment-card' : 'comment-reply'"
    >
      <div class="flex gap-3 sm:gap-4">
        <!-- 头像：移动端缩小到 32px -->
        <AppImage
          class="h-8 w-8 shrink-0 rounded-full border border-[var(--blog-border)] bg-white object-cover sm:h-11 sm:w-11"
          :src="comment.avatarUrl"
          :alt="comment.nickname"
        />

        <div class="min-w-0 flex-1">
          <!-- 用户名和日期：优化层级 -->
          <div class="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div class="min-w-0">
              <h3 class="truncate text-[0.875rem] font-bold leading-tight text-[#1a1a1a] letter-spacing-[0.01em]">
                {{ comment.nickname }}
              </h3>
            </div>

            <!-- 日期：12px，浅色 -->
            <time
              class="shrink-0 text-[0.75rem] leading-tight text-[var(--blog-subtle)]"
              :datetime="comment.createdAt"
            >
              {{ formatCommentDate(comment.createdAt) }}
            </time>
          </div>

          <!-- Meta 信息：降低视觉权重，放在内容下方 -->
          <div v-if="props.depth === 0" class="mt-1">
            <CommentMeta
              class="opacity-60 transition-opacity hover:opacity-100"
              :browser-label="comment.browserLabel"
              :os-label="comment.osLabel"
              :user-agent="comment.userAgent"
              :country-name="comment.countryName"
              :compact="true"
              :show-browser="false"
            />
          </div>

          <!-- 评论内容：优化行高和间距 -->
          <div class="mt-2.5">
            <p
              v-if="!shouldCollapse(comment.content) || expandedComments?.includes(comment.id)"
              class="whitespace-pre-wrap break-words text-[0.9375rem] leading-[1.8] text-[#2c2c2c] letter-spacing-[0.008em]"
            >
              {{ comment.content }}
            </p>

            <!-- 折叠状态：显示前 500 字 + 展开按钮 -->
            <template v-else>
              <p class="whitespace-pre-wrap break-words text-[0.9375rem] leading-[1.8] text-[#2c2c2c] letter-spacing-[0.008em] line-clamp-[8]">
                {{ comment.content.slice(0, COLLAPSE_THRESHOLD) }}...
              </p>
              <button
                class="mt-2 text-[0.8125rem] font-medium text-[var(--blog-accent)] hover:underline"
                @click="toggleExpand(comment.id)"
              >
                展开阅读全文 ({{ comment.content.length }} 字)
              </button>
            </template>
          </div>

          <!-- 辅助信息：回复按钮等（放在内容下方） -->
          <div class="mt-2 flex items-center gap-3">
            <button
              class="text-[0.75rem] font-medium text-[var(--blog-subtle)] hover:text-[var(--blog-accent)] transition-colors"
              @click="emit('reply', comment.id)"
            >
              回复
            </button>
          </div>
        </div>
      </div>

      <!-- 回复列表：优化缩进和视觉连线 -->
      <div v-if="comment.replies.length > 0" class="comment-replies">
        <div class="comment-thread-line"></div>
        <CommentThread
          :comments="comment.replies"
          :depth="props.depth + 1"
          @reply="emit('reply', $event)"
        />
      </div>
    </article>
  </div>
</template>

<style scoped>
/* 1. 黄金行高与字符间距 */
:deep(.comment-content) {
  line-height: 1.8;
  letter-spacing: 0.008em;
}

/* 2. 视觉层级：无边框排版，改用留白和细微分割 */
.comment-card {
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.95);
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 回复评论：去掉厚重边框，改用留白 */
.comment-reply {
  padding: 0.75rem 0 0.75rem 1rem;
  border-left: 2px solid var(--blog-border);
  transition: border-color 0.2s ease;
}

.comment-reply:hover {
  border-left-color: var(--blog-accent);
}

/* 3. 层级缩进：缩进 1.5rem，移动端更小 */
.comment-replies {
  position: relative;
  margin-top: 1rem;
  margin-left: 1.5rem;
  padding-left: 1.25rem;
}

/* 视觉连线：浅灰色垂直线 */
.comment-thread-line {
  position: absolute;
  left: -1px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    var(--blog-border) 0%,
    rgba(226, 232, 240, 0.3) 100%
  );
  border-radius: 1px;
}

/* 4. 响应式适配：移动端减小内边距和头像 */
@media (max-width: 640px) {
  .comment-card {
    padding: 1rem;
  }

  .comment-replies {
    margin-left: 0.75rem;
    padding-left: 0.875rem;
  }

  .comment-reply {
    padding-left: 0.625rem;
    border-left-width: 1.5px;
  }
}

/* 5. 对比度保护：确保 --blog-subtle 符合 WCAG AA */
:deep(.comment-meta-chip) {
  color: #64748b; /* slate-500，对比度 4.5:1+ */
}
</style>
