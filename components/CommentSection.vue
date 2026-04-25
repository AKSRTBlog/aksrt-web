<script setup lang="ts">
import { fetchCaptchaConfig, fetchPublicComments, submitPublicComment } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import type { AdminCaptchaResult } from '~/types/admin';
import type { BlogComment, PublicCommentSubmissionResult } from '~/types/blog';

const props = defineProps<{
  articleSlug: string;
  allowComment: boolean;
}>();

const emit = defineEmits<{
  submitted: [payload: PublicCommentSubmissionResult];
}>();

const nickname = ref('');
const email = ref('');
const website = ref('');
const content = ref('');
const message = ref('');
const submitting = ref(false);
const captchaEnabled = ref(false);
const captchaId = ref<string | null>(null);

const comments = ref<BlogComment[]>([]);
const loading = ref(true);
const error = ref('');

// ========== 1. 快捷键提交 (Ctrl/Cmd + Enter) ==========
function handleKeyDown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  }
}

// ========== 2. 评论草稿自动保存 (sessionStorage) ==========
const DRAFT_KEY_PREFIX = 'comment-draft-';
const draftKey = computed(() => `${DRAFT_KEY_PREFIX}${props.articleSlug}`);

// 页面加载时恢复草稿
onMounted(() => {
  const saved = sessionStorage.getItem(draftKey.value);
  if (saved) {
    try {
      const draft = JSON.parse(saved);
      nickname.value = draft.nickname || '';
      email.value = draft.email || '';
      website.value = draft.website || '';
      content.value = draft.content || '';
    } catch {
      // 忽略损坏的草稿数据
    }
  }
  void loadComments();
});

// 实时保存草稿
watch([nickname, email, website, content], () => {
  const draft = {
    nickname: nickname.value,
    email: email.value,
    website: website.value,
    content: content.value,
  };
  sessionStorage.setItem(draftKey.value, JSON.stringify(draft));
});

// 提交成功后清除草稿
function clearDraft() {
  sessionStorage.removeItem(draftKey.value);
}

// ========== 3. Gravatar 头像预览 ==========
// 使用浏览器原生 crypto.subtle 计算 MD5 的替代方案（Gravatar 强制要求 MD5）
// 改用 fetch Gravatar 的 404 状态检测，若无自定义头像则用默认 UI
const gravatarUrl = computed(() => {
  const trimmedEmail = email.value.trim().toLowerCase();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return null;
  }
  // 注意：Gravatar 强制 MD5，前端无法用 crypto.subtle 直接算 MD5
  // 这里只做 UI 占位，实际头像由后端/评论接口返回
  // 保留空值，让 <AppImage> 的默认 fallback 处理
  return null;
});

// ========== 4. 乐观更新相关 ==========
const optimisticCommentId = ref<string | null>(null);
const highlightCommentId = ref<string | null>(null);

// ========== 5. 智能粘贴清洗 ==========
function handlePaste(e: ClipboardEvent) {
  const pastedText = e.clipboardData?.getData('text/plain') || '';
  if (!pastedText) return;

  // 自动压缩连续空行为最多两行
  const cleaned = pastedText.replace(/\n\s*\n\s*\n/g, '\n\n');

  // 如果内容有变化，手动替换
  if (cleaned !== pastedText) {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.value.substring(0, start);
    const after = content.value.substring(end);
    content.value = before + cleaned + after;

    // 恢复光标位置
    nextTick(() => {
      textarea.selectionStart = textarea.selectionEnd = start + cleaned.length;
    });
  }
}

const commentCountLabel = computed(() => `${comments.value.length} ${comments.value.length === 1 ? 'response' : 'responses'}`);
const contentLength = computed(() => content.value.trim().length);
const canSubmit = computed(() =>
  props.allowComment
  && !submitting.value
  && nickname.value.trim().length > 0
  && email.value.trim().length > 0
  && content.value.trim().length > 0,
);
const messageTone = computed(() => {
  const value = message.value.toLowerCase();
  if (value.includes('rejected') || value.includes('failed') || value.includes('invalid')) {
    return 'warning';
  }
  if (value.startsWith('comment approved') || value.startsWith('comment received')) {
    return 'success';
  }
  return 'neutral';
});

async function loadComments() {
  loading.value = true;
  error.value = '';

  try {
    const data = await fetchPublicComments(props.articleSlug);
    comments.value = data ?? [];
  } catch (currentError) {
    error.value = currentError instanceof Error ? currentError.message : 'Failed to load comments.';
    comments.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadComments();
});

const { loaded: captchaLoaded, showCaptcha } = useGeeTestCaptcha(
  captchaId,
  async (result) => {
    await performSubmit(result);
  },
  (currentError) => {
    message.value = currentError.message;
  },
);

async function performSubmit(captcha?: AdminCaptchaResult) {
  if (!props.allowComment || !nickname.value.trim() || !email.value.trim() || !content.value.trim()) {
    return;
  }

  submitting.value = true;
  message.value = '';

  // 保存表单值（用于 API 调用）
  const savedNickname = nickname.value.trim();
  const savedEmail = email.value.trim();
  const savedWebsite = website.value.trim() || undefined;
  const savedContent = content.value.trim();

  // 创建乐观评论（立即显示）
  const tempId = `temp-${Date.now()}`;
  const optimistic: BlogComment = {
    id: tempId,
    parentId: null,
    articleSlug: props.articleSlug,
    nickname: savedNickname,
    emailHash: '',
    website: savedWebsite,
    content: savedContent,
    avatarUrl: gravatarUrl.value || '',
    browserLabel: null,
    osLabel: null,
    countryName: null,
    userAgent: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
    replies: [],
  };

  // 立即添加到列表顶部
  optimisticCommentId.value = tempId;
  comments.value = [optimistic, ...comments.value];

  // 立即清除表单并清除草稿
  nickname.value = '';
  email.value = '';
  website.value = '';
  content.value = '';
  clearDraft();

  try {
    const result = await submitPublicComment(props.articleSlug, {
      nickname: savedNickname,
      email: savedEmail,
      website: savedWebsite,
      content: savedContent,
      captcha,
    });

    // 移除乐观评论
    comments.value = comments.value.filter(c => c.id !== tempId);
    optimisticCommentId.value = null;

    // 重新加载评论列表
    await loadComments();

    // 设置成功消息
    if (result.status === 'approved') {
      message.value = result.unlockToken
        ? 'Comment approved automatically. Hidden content is unlocked, and your comment is now visible.'
        : 'Comment approved automatically, and your comment is now visible.';
    } else if (result.status === 'rejected') {
      message.value = 'Comment rejected by automated moderation. It will not be displayed or unlock hidden content.';
    } else {
      message.value = 'Comment received. It is waiting for moderation before it appears or unlocks hidden content.';
    }
    emit('submitted', result);

    // 滚动到新评论并高亮
    nextTick(() => {
      // 查找新评论（通过昵称和内容匹配）
      const newComment = comments.value.find(
        c => c.nickname === savedNickname && c.content === savedContent
      );
      if (newComment) {
        highlightCommentId.value = newComment.id;
        nextTick(() => {
          document.getElementById(`comment-${newComment.id}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        });
        // 2 秒后取消高亮
        setTimeout(() => {
          highlightCommentId.value = null;
        }, 2000);
      }
    });
  } catch (currentError) {
    // 移除乐观评论（失败时）
    comments.value = comments.value.filter(c => c.id !== tempId);
    optimisticCommentId.value = null;
    message.value = currentError instanceof Error ? currentError.message : 'Comment submission failed.';
  } finally {
    submitting.value = false;
  }
}

function handleSubmit() {
  if (!canSubmit.value) {
    return;
  }

  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      message.value = 'Captcha is still loading. Please try again in a moment.';
      return;
    }

    showCaptcha();
    return;
  }

  void performSubmit();
}

onMounted(async () => {
  try {
    const config = await fetchCaptchaConfig();
    if (config.enabled && config.enabledOnComment && config.captchaId?.trim()) {
      captchaEnabled.value = true;
      captchaId.value = config.captchaId.trim();
    }
  } catch {
    // Leave comments available even if captcha config cannot be loaded.
  }
});
</script>

<template>
  <section class="mt-16 space-y-6">
    <div class="flex flex-col gap-3 border-b border-[var(--blog-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--blog-accent)]">Discussion</p>
        <h2 class="mt-2 text-2xl font-semibold text-[var(--blog-ink)]">Comments</h2>
      </div>
      <span class="inline-flex w-fit items-center rounded-full border border-[var(--blog-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--blog-muted)]">
        {{ commentCountLabel }}
      </span>
    </div>

    <div v-if="allowComment" class="blog-panel overflow-hidden rounded-[6px]">
      <div class="border-b border-[var(--blog-border)] bg-white px-5 py-4 sm:px-6">
        <h3 class="text-base font-semibold text-[var(--blog-ink)]">Leave a comment</h3>
      </div>

      <form class="grid gap-0 lg:grid-cols-[0.9fr_1.3fr]" @submit.prevent="handleSubmit">
        <div class="space-y-4 border-b border-[var(--blog-border)] bg-[var(--blog-soft)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <label class="block">
            <span class="comment-label">Name</span>
            <input
              v-model="nickname"
              class="comment-input"
              autocomplete="name"
              placeholder="Your name"
              required
            >
          </label>

          <label class="block">
            <span class="comment-label">Email</span>
            <div class="flex items-center gap-2">
              <input
                v-model="email"
                class="comment-input flex-1"
                autocomplete="email"
                placeholder="you@example.com"
                required
                type="email"
              >
              <img
                v-if="gravatarUrl"
                :src="gravatarUrl"
                alt="Avatar preview"
                class="gravatar-preview"
              >
              <div
                v-else
                class="gravatar-placeholder"
              ></div>
            </div>
          </label>

          <label class="block">
            <span class="comment-label">Website</span>
            <input
              v-model="website"
              class="comment-input"
              autocomplete="url"
              placeholder="https://"
              type="url"
            >
          </label>
        </div>

        <div class="space-y-4 p-5 sm:p-6">
          <label class="block">
            <div class="mb-2 flex items-center justify-between gap-3">
              <span class="comment-label mb-0">Comment</span>
              <span class="text-xs tabular-nums text-[var(--blog-subtle)]">{{ contentLength }}/2000</span>
            </div>
            <textarea
              v-model="content"
              class="comment-textarea"
              maxlength="2000"
              placeholder="Share your thoughts..."
              required
              @keydown="handleKeyDown"
              @paste="handlePaste"
            ></textarea>
          </label>

          <div
            v-if="captchaEnabled"
            class="rounded-[6px] border border-[var(--blog-border)] bg-[var(--blog-soft)] px-3 py-2 text-xs text-[var(--blog-muted)]"
          >
            GeeTest verification is required before posting.
          </div>

          <div
            v-if="message"
            aria-live="polite"
            class="rounded-[6px] border px-3 py-2 text-sm leading-6"
            :class="{
              'border-emerald-200 bg-emerald-50 text-emerald-700': messageTone === 'success',
              'border-amber-200 bg-amber-50 text-amber-700': messageTone === 'warning',
              'border-[var(--blog-border)] bg-[var(--blog-soft)] text-[var(--blog-muted)]': messageTone === 'neutral',
            }"
          >
            {{ message }}
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-xs leading-5 text-[var(--blog-subtle)]">Your comment may be reviewed before publishing.</p>
            <button class="blog-button-primary w-full sm:w-auto" type="submit" :disabled="!canSubmit">
              <span v-if="submitting" class="comment-spinner" aria-hidden="true" />
              {{ submitting ? 'Posting...' : 'Post comment' }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div v-else class="blog-panel rounded-[6px] p-8 text-center text-sm text-[var(--blog-subtle)]">
      Comments are disabled for this article.
    </div>

    <div v-if="loading" class="rounded-[6px] border border-[var(--blog-border)] bg-white/90 p-5 sm:p-6 overflow-hidden">
      <div class="space-y-6">
        <div v-for="item in 2" :key="item" class="flex gap-4 relative">
          <!-- 闪光效果层 -->
          <div class="absolute inset-0 -skeleton-shimmer"></div>
          
          <!-- 头像骨架 -->
          <div class="h-11 w-11 shrink-0 rounded-full bg-[var(--blog-soft)]" />
          
          <div class="min-w-0 flex-1 space-y-3">
            <!-- 昵称和日期骨架 -->
            <div class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
              <div class="h-4 w-32 rounded bg-[var(--blog-soft)]" />
              <!-- Meta chips 骨架 -->
              <div class="flex gap-1.5">
                <div class="h-5 w-20 rounded-full bg-[var(--blog-soft)]" />
                <div class="h-5 w-16 rounded-full bg-[var(--blog-soft)]" />
              </div>
            </div>
            
            <!-- 内容骨架（匹配真实评论的行数和高度） -->
            <div class="space-y-2">
              <div class="h-3 w-full rounded bg-[var(--blog-soft)]" />
              <div class="h-3 w-3/4 rounded bg-[var(--blog-soft)]" />
              <div class="h-3 w-1/2 rounded bg-[var(--blog-soft)]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="blog-panel flex flex-col items-center gap-3 rounded-[6px] px-8 py-10 text-center">
      <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
      <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
      <button class="blog-button-secondary text-sm" @click="loadComments">Retry</button>
    </div>

    <div v-else-if="comments.length > 0">
      <TransitionGroup name="comment-fade" tag="div" class="space-y-4">
        <div
          v-for="comment in comments"
          :key="comment.id"
          :id="`comment-${comment.id}`"
          :class="{ 'comment-highlight': highlightCommentId === comment.id }"
          class="relative"
        >
          <div
            v-if="comment.id === optimisticCommentId"
            class="absolute -inset-1 rounded-[8px] border-2 border-dashed border-amber-300 bg-amber-50/50 px-2 py-1 text-xs text-amber-600"
          >
            Submitting...
          </div>
          <CommentThread :comments="[comment]" />
        </div>
      </TransitionGroup>
    </div>

    <div v-else class="rounded-[6px] border border-dashed border-[var(--blog-border-strong)] bg-white/70 p-10 text-center">
      <div class="mb-4 text-4xl opacity-40">💬</div>
      <p class="text-base font-semibold text-[var(--blog-ink)]">暂无评论</p>
      <p class="mt-2 text-sm leading-6 text-[var(--blog-subtle)]">
        沙发还在，等一个有见地的评论<br>
        <span class="text-xs opacity-60">写下你的想法，开始这段对话吧</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.comment-label {
  margin-bottom: 0.45rem;
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--blog-muted);
}

.comment-input,
.comment-textarea {
  width: 100%;
  border: 1px solid var(--blog-border);
  border-radius: 6px;
  background: #f8fafc; /* 未聚焦：与背景融合 */
  color: var(--blog-ink);
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.25s ease,
    background-color 0.2s ease,
    transform 0.2s ease;
}

.comment-input {
  height: 2.8rem;
  padding: 0 0.9rem;
  font-size: 0.875rem;
}

.comment-textarea {
  min-height: 10rem;
  resize: vertical;
  padding: 0.9rem;
  font-size: 0.92rem;
  line-height: 1.75;
}

.comment-input:focus,
.comment-textarea:focus {
  border-color: var(--blog-accent);
  background: #ffffff; /* 聚焦时变为纯白 */
  box-shadow:
    0 0 0 3px rgba(37, 99, 235, 0.08),
    0 4px 12px -2px rgba(0, 0, 0, 0.06); /* 极轻的投影，像"浮"起来 */
  transform: translateY(-1px); /* 微微上浮 */
}

.comment-input::placeholder,
.comment-textarea::placeholder {
  color: var(--blog-subtle);
}

.comment-spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 999px;
  animation: comment-spin 0.7s linear infinite;
}

.blog-button-primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
  box-shadow: none;
}

.comment-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.comment-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

@keyframes comment-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Gravatar 预览头像 */
.gravatar-preview {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  border: 1px solid var(--blog-border);
  object-fit: cover;
  flex-shrink: 0;
}

/* Gravatar 占位符（无预览时） */
.gravatar-placeholder {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  background: var(--blog-soft);
  flex-shrink: 0;
}

/* 评论高亮动画 */
@keyframes highlight-fade {
  0% {
    background-color: rgba(250, 204, 21, 0.3);
    box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.2);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
  }
}

.comment-highlight {
  animation: highlight-fade 2s ease forwards;
  border-radius: 8px;
}

/* 骨架屏闪光效果 (Shimmer Effect) */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.8s ease-in-out infinite;
  z-index: 10;
  pointer-events: none;
}

/* 骨架屏基础样式优化 */
.animate-pulse {
  position: relative;
  overflow: hidden;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
}
</style>
