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

  try {
    const result = await submitPublicComment(props.articleSlug, {
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
    await loadComments();
  } catch (currentError) {
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
            <input
              v-model="email"
              class="comment-input"
              autocomplete="email"
              placeholder="you@example.com"
              required
              type="email"
            >
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

    <div v-if="loading" class="rounded-[6px] border border-[var(--blog-border)] bg-white/88 p-5 sm:p-6">
      <div class="space-y-5">
        <div v-for="item in 2" :key="item" class="flex gap-4">
          <div class="h-11 w-11 shrink-0 animate-pulse rounded-full bg-[var(--blog-soft)]" />
          <div class="min-w-0 flex-1 space-y-3">
            <div class="h-4 w-32 animate-pulse rounded bg-[var(--blog-soft)]" />
            <div class="space-y-2">
              <div class="h-3 w-full animate-pulse rounded bg-[var(--blog-soft)]" />
              <div class="h-3 w-2/3 animate-pulse rounded bg-[var(--blog-soft)]" />
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
        <CommentThread :key="'loaded'" :comments="comments" />
      </TransitionGroup>
    </div>

    <div v-else class="rounded-[6px] border border-dashed border-[var(--blog-border-strong)] bg-white/70 p-8 text-center">
      <p class="text-sm font-semibold text-[var(--blog-ink)]">No comments yet</p>
      <p class="mt-2 text-sm text-[var(--blog-subtle)]">Be the first to leave one.</p>
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
  background: #ffffff;
  color: var(--blog-ink);
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background-color 0.18s ease;
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
  box-shadow: 0 0 0 4px rgba(177, 93, 50, 0.1);
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
</style>
