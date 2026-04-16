<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import { fetchCaptchaConfig, fetchPublicFooterLinks, submitPublicFriendLinkApplication } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import type { AdminCaptchaResult } from '~/types/admin';

const { data: links } = await useAsyncData('friend-links', fetchPublicFooterLinks);

const form = reactive({
  siteName: '',
  siteUrl: '',
  iconUrl: '',
  description: '',
  contactName: '',
  contactEmail: '',
});

const submitting = ref(false);
const submitMessage = ref('');
const captchaEnabled = ref(false);
const captchaId = ref<string | null>(null);

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

const { loaded: captchaLoaded, showCaptcha } = useGeeTestCaptcha(
  captchaId,
  async (result) => {
    await performSubmit(result);
  },
  (error) => {
    submitMessage.value = error.message;
  },
);

async function performSubmit(captcha?: AdminCaptchaResult) {
  if (!form.siteName.trim() || !form.siteUrl.trim() || !form.description.trim() || !form.contactName.trim() || !form.contactEmail.trim()) {
    return;
  }

  submitting.value = true;
  submitMessage.value = '';

  try {
    await submitPublicFriendLinkApplication({
      siteName: form.siteName.trim(),
      siteUrl: form.siteUrl.trim(),
      iconUrl: form.iconUrl.trim() || undefined,
      description: form.description.trim(),
      contactName: form.contactName.trim(),
      contactEmail: form.contactEmail.trim(),
      captcha,
    });

    form.siteName = '';
    form.siteUrl = '';
    form.iconUrl = '';
    form.description = '';
    form.contactName = '';
    form.contactEmail = '';
    submitMessage.value = 'Application submitted. It will appear after review.';
  } catch (error) {
    submitMessage.value = error instanceof Error ? error.message : 'Application submission failed.';
  } finally {
    submitting.value = false;
  }
}

async function handleSubmit() {
  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      submitMessage.value = 'Captcha is still loading. Please try again in a moment.';
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

    if (config.enabled && config.enabledOnFriendLink && config.captchaId?.trim()) {
      captchaEnabled.value = true;
      captchaId.value = config.captchaId.trim();
    }
  } catch {
    // Keep the form usable if captcha config bootstrap fails.
  }
});

useSeoMeta({
  title: 'Links',
  description: 'Partner sites and a public link exchange form.',
});
</script>

<template>
  <div>
    <PageHero
      centered
      eyebrow="Links"
      title="Partner sites"
      description="Browse curated partner sites or submit your own site for review."
    />

    <section class="mx-auto max-w-6xl px-6 pb-10">
      <div class="grid gap-4 md:grid-cols-2">
        <a
          v-for="item in links || []"
          :key="item.id"
          :href="item.href"
          :target="isExternal(item.href) ? '_blank' : undefined"
          :rel="isExternal(item.href) ? 'noopener noreferrer' : undefined"
          class="blog-panel flex items-center gap-4 border border-[var(--blog-border)] p-5 transition hover:border-[var(--blog-accent)] hover:bg-[var(--blog-soft)]"
        >
          <AppImage
            v-if="item.iconUrl"
            :src="item.iconUrl"
            :alt="item.label"
            class="h-14 w-14 shrink-0 rounded-2xl border border-[var(--blog-border)] object-cover"
          />
          <div
            v-else
            class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] text-lg font-semibold text-[var(--blog-ink)]"
          >
            {{ item.label.slice(0, 1).toUpperCase() }}
          </div>

          <div class="min-w-0">
            <p class="text-base font-medium text-[var(--blog-ink)]">{{ item.label }}</p>
            <p class="mt-2 text-sm leading-7 text-[var(--blog-muted)]">{{ item.description || 'Curated partner site.' }}</p>
          </div>
        </a>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="blog-panel border border-[var(--blog-border)] p-6 sm:p-8">
        <h2 class="text-2xl font-semibold text-[var(--blog-ink)]">Submit your site</h2>
        <p class="mt-3 text-sm leading-7 text-[var(--blog-muted)]">
          Share your site profile and contact information. Approved sites can be added to the public links list.
        </p>

        <form class="mt-6 space-y-4" @submit.prevent="handleSubmit">
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.siteName" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Site name" required>
            <input v-model="form.siteUrl" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="https://example.com" type="url" required>
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <input v-model="form.iconUrl" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Icon URL (optional)" type="url">
            <input v-model="form.contactName" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Contact name" required>
          </div>
          <input v-model="form.contactEmail" class="w-full rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm outline-none" placeholder="Contact email" type="email" required>
          <textarea
            v-model="form.description"
            class="min-h-28 w-full rounded-3xl border border-[var(--blog-border)] bg-[var(--blog-soft)] px-4 py-3 text-sm leading-7 outline-none"
            placeholder="Describe your site in a few sentences."
            required
          ></textarea>

          <p v-if="captchaEnabled" class="text-xs text-[var(--blog-muted)]">
            GeeTest verification is required before this application can be submitted.
          </p>

          <div class="flex flex-wrap items-center gap-3">
            <button class="blog-button-primary" type="submit" :disabled="submitting">
              {{ submitting ? 'Submitting...' : 'Submit application' }}
            </button>
            <span v-if="submitMessage" class="text-sm text-[var(--blog-muted)]">{{ submitMessage }}</span>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>
