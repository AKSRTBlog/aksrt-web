<script setup lang="ts">
import { fetchCaptchaConfig, fetchPublicComments, submitPublicComment } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import type { AdminCaptchaResult, BlogComment } from '~/types/admin';

const props = defineProps<{
  articleSlug: string;
  allowComment: boolean;
}>();

// --- 表单状态 ---
const nickname = ref('');
const email = ref('');
const website = ref('');
const content = ref('');
const message = ref('');
const submitting = ref(false);
const captchaEnabled = ref(false);
const captchaId = ref<string | null>(null);

// --- 评论列表状态（纯客户端加载）---
const comments = ref<BlogComment[]>([]);
const loading = ref(true);
const error = ref('');

// 客户端异步加载评论
async function loadComments() {
  loading.value = true;
  error.value = '';
  try {
    const data = await fetchPublicComments(props.articleSlug);
    comments.value = data ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load comments.';
    comments.value = [];
  } finally {
    loading.value = false;
  }
}

// 仅在客户端挂载时加载（不参与 SSR）
onMounted(() => {
  loadComments();
});

// --- 验证码 ---
const { loaded: captchaLoaded, showCaptcha } = useGeeTestCaptcha(
  captchaId,
  async (result) => {
    await performSubmit(result);
  },
  (error) => {
    message.value = error.message;
  },
);

async function performSubmit(captcha?: AdminCaptchaResult) {
  if (!props.allowComment || !nickname.value.trim() || !email.value.trim() || !content.value.trim()) {
    return;
  }

  submitting.value = true;
  message.value = '';

  try {
    await submitPublicComment(props.articleSlug, {
      nickname: nickname.value.trim(),
      email: email.value.trim(),
      website: website.value.trim() || undefined,
      content: content.value.trim(),
      captcha,
    });

    nickname.value = '';
    email.value = '';
    website.value = '';
    content.value = '';
    message.value = 'Comment received. It will appear after moderation.';
    // 提交成功后重新加载评论列表
    await loadComments();
  } catch (err) {
    message.value = err instanceof Error ? err.message : 'Comment submission failed.';
  } finally {
    submitting.value = false;
  }
}

function handleSubmit() {
  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      message.value = 'Captcha is still loading. Please try again in a moment.';
      return;
    }
    showCaptcha();
    return;
  }
  performSubmit();
}

// 加载验证码配置
onMounted(async () => {
  try {
    const config = await fetchCaptchaConfig();
    if (config.enabled && config.enabledOnComment && config.captchaId?.trim()) {
      captchaEnabled.value = true;
      captchaId.value = config.captchaId.trim();
    }
  } catch {
    // 验证码加载失败不影响评论功能
  }
});
</script>

<template>
  <section class="mt-16">
    <div class="flex items-center gap-3">
      <h2 class="text-2xl font-semibold text-[var(--blog-ink)]">Comments</h2>
      <span class="rounded-full bg-[var(--blog-soft)] px-3 py-1 text-xs text-[var(--blog-subtle)]">{{ comments.length }}</span>
    </div>

    <!-- 评论表单 -->
    <div v-if="allowComment" class="blog-panel mt-8 rounded-none p-6 sm:rounded-[4px] md:p-8">
      <h3 class="text-lg font-semibold text-[var(--blog-ink)]">Share your thoughts</h3>
      <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 md:grid-cols-2">
          <input v-model="nickname" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Name" required>
          <input v-model="email" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Email" type="email" required>
        </div>
        <input v-model="website" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Website (optional)" type="url">
        <textarea
          v-model="content"
          class="min-h-32 w-full rounded-3xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm leading-7 outline-none"
          placeholder="Write a comment..."
          required
        ></textarea>

        <p v-if="captchaEnabled" class="text-xs text-[var(--blog-muted)]">
          GeeTest verification is required before this comment can be submitted.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <button class="blog-button-primary" type="submit" :disabled="submitting">
            {{ submitting ? 'Submitting...' : 'Post comment' }}
          </button>
          <span v-if="message" class="text-sm" :class="message.includes('received') ? 'text-emerald-600' : 'text-[var(--blog-muted)]'">{{ message }}</span>
        </div>
      </form>
    </div>

    <div v-else class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      Comments are disabled for this article.
    </div>

    <!-- 评论列表：AJAX 加载状态 -->
    <!-- 骨架屏 / 加载中 -->
    <div v-if="loading" class="mt-8 space-y-6 rounded-none border border-[var(--blog-border)] bg-white/88 px-6 py-6 sm:rounded-[4px] sm:px-6">
      <div class="flex items-start gap-4">
        <div class="animate-pulse h-10 w-10 rounded-full bg-[var(--blog-soft)]" />
        <div class="flex-1 space-y-3">
          <div class="animate-pulse h-4 w-24 rounded bg-[var(--blog-soft)]" />
          <div class="space-y-2">
            <div class="animate-pulse h-3 w-full rounded bg-[var(--blog-soft)]" />
            <div class="animate-pulse h-3 w-3/4 rounded bg-[var(--blog-soft)]" />
          </div>
        </div>
      </div>
      <div class="flex items-start gap-4">
        <div class="animate-pulse h-10 w-10 rounded-full bg-[var(--blog-soft)]" />
        <div class="flex-1 space-y-3">
          <div class="animate-pulse h-4 w-28 rounded bg-[var(--blog-soft)]" />
          <div class="space-y-2">
            <div class="animate-pulse h-3 w-full rounded bg-[var(--blog-soft)]" />
            <div class="animate-pulse h-3 w-1/2 rounded bg-[var(--blog-soft)]" />
          </div>
        </div>
      </div>
    </div>

    <!-- 加载失败 -->
    <div v-else-if="error" class="blog-panel mt-8 flex flex-col items-center gap-3 rounded-none px-8 py-10 text-center sm:rounded-[4px]">
      <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
      <p class="text-sm text-[var(--blog-subtle)]">{{ error }}</p>
      <button class="blog-button-secondary text-sm" @click="loadComments">Retry</button>
    </div>

    <!-- 评论列表 -->
    <div v-else-if="comments.length > 0" class="mt-8 rounded-none border border-[var(--blog-border)] bg-white/88 px-4 py-6 sm:rounded-[4px] sm:px-6">
      <TransitionGroup name="comment-fade" tag="div" class="space-y-6">
        <CommentThread :key="'loaded'" :comments="comments" />
      </TransitionGroup>
    </div>

    <!-- 空状态 -->
    <div v-else class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      No comments yet. Be the first to leave one.
    </div>
  </section>
</template>

<style scoped>
/* 评论列表淡入动画 */
.comment-fade-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.comment-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
</style>
