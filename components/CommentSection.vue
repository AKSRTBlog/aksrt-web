<script setup lang="ts">
import { fetchCaptchaConfig, fetchPublicComments, submitPublicComment } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import type { AdminCaptchaResult } from '~/types/admin';

const props = defineProps<{
  articleSlug: string;
  allowComment: boolean;
}>();

const nickname = ref('');
const email = ref('');
const website = ref('');
const content = ref('');
const message = ref('');
const submitting = ref(false);
const captchaEnabled = ref(false);
const captchaId = ref<string | null>(null);

const { data: comments, refresh, pending } = await useAsyncData(
  () => `comments-${props.articleSlug}`,
  () => fetchPublicComments(props.articleSlug),
);

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
    await refresh();
  } catch (error) {
    message.value = error instanceof Error ? error.message : 'Comment submission failed.';
  } finally {
    submitting.value = false;
  }
}

async function handleSubmit() {
  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      message.value = 'Captcha is still loading. Please try again in a moment.';
      return;
    }

    showCaptcha();
    return;
  }

  await performSubmit();
}

onMounted(async () => {
  try {
    const config = await fetchCaptchaConfig();

    if (config.enabled && config.enabledOnComment && config.captchaId?.trim()) {
      captchaEnabled.value = true;
      captchaId.value = config.captchaId.trim();
    }
  } catch {
    // Keep comment submission available if captcha config bootstrap fails.
  }
});
</script>

<template>
  <section class="mt-16">
    <div class="flex items-center gap-3">
      <h2 class="text-2xl font-semibold text-[var(--blog-ink)]">Comments</h2>
      <span class="rounded-full bg-[var(--blog-soft)] px-3 py-1 text-xs text-[var(--blog-subtle)]">{{ comments?.length || 0 }}</span>
    </div>

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
          <span v-if="message" class="text-sm text-[var(--blog-muted)]">{{ message }}</span>
        </div>
      </form>
    </div>

    <div v-else class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      Comments are disabled for this article.
    </div>

    <div v-if="pending" class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      Loading comments...
    </div>
    <div v-else-if="comments && comments.length > 0" class="mt-8 rounded-none border border-[var(--blog-border)] bg-white/88 px-4 py-6 sm:rounded-[4px] sm:px-6">
      <CommentThread :comments="comments" />
    </div>
    <div v-else class="blog-panel mt-8 rounded-none p-8 text-center text-sm text-[var(--blog-subtle)] sm:rounded-[4px]">
      No comments yet. Be the first to leave one.
    </div>
  </section>
</template>
