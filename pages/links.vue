<script setup lang="ts">
import AppImage from '~/components/AppImage.vue';
import { fetchCaptchaConfig, fetchPublicFooterLinks, submitPublicFriendLinkApplication } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import type { AdminCaptchaResult } from '~/types/admin';
import type { PublicFooterLinkItem } from '~/types/blog';

const siteSettings = inject<ReturnType<typeof useAsyncData>['value']>('site-settings');

// 纯客户端 AJAX 加载友情链接
const links = ref<PublicFooterLinkItem[]>([]);
const linksLoading = ref(true);
const linksError = ref('');

async function loadLinks() {
  linksLoading.value = true;
  linksError.value = '';
  try {
    const data = await fetchPublicFooterLinks();
    links.value = data ?? [];
  } catch (e) {
    linksError.value = e instanceof Error ? e.message : 'Failed to load friend links.';
    links.value = [];
  } finally {
    linksLoading.value = false;
  }
}

onMounted(() => {
  loadLinks();
});

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

function handleSubmit() {
  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      submitMessage.value = 'Captcha is still loading. Please try again in a moment.';
      return;
    }
    showCaptcha();
    return;
  }
  performSubmit();
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

const linksCanonicalUrl = computed(() => {
  const base = siteSettings.value?.seo?.canonicalUrl?.replace(/\/+$/, '') || '';
  return base ? `${base}/links` : '';
});

useSeoMeta({
  title: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Links',
  description: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
  ogTitle: () => siteSettings.value?.siteTitle || siteSettings.value?.seo?.title || 'Links',
  ogDescription: () => siteSettings.value?.siteDescription || siteSettings.value?.seo?.description || '',
});

useHead(() => ({
  link: linksCanonicalUrl.value
    ? [
        {
          rel: 'canonical',
          href: linksCanonicalUrl.value,
        },
      ]
    : [],
  meta: linksCanonicalUrl.value
    ? [
        {
          property: 'og:url',
          content: linksCanonicalUrl.value,
        },
      ]
    : [],
}));
</script>

<template>
  <div>
    <section class="mx-auto max-w-6xl px-6 pb-10">
      <!-- 友情链接列表：AJAX 加载 -->
      <template v-if="linksLoading">
        <div class="grid gap-4 md:grid-cols-2">
          <div v-for="i in 6" :key="i" class="animate-pulse flex items-center gap-4 rounded-[4px] border border-[var(--blog-border)] p-5">
            <div class="h-14 w-14 shrink-0 rounded-2xl border border-[var(--blog-border)] bg-[var(--blog-soft)]" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="h-4 w-1/2 rounded bg-[var(--blog-soft)]" />
              <div class="h-3 w-3/4 rounded bg-[var(--blog-soft)]" />
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="linksError">
        <div class="blog-panel flex flex-col items-center gap-3 py-12 text-center">
          <svg class="h-10 w-10 text-[var(--blog-subtle)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/></svg>
          <p class="text-sm text-[var(--blog-subtle)]">{{ linksError }}</p>
          <button class="blog-button-secondary text-sm" @click="loadLinks">Retry</button>
        </div>
      </template>

      <template v-else-if="links.length > 0">
        <div class="grid gap-4 md:grid-cols-2">
          <a
            v-for="item in links"
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
      </template>

      <template v-else>
        <div class="blog-panel py-12 text-center text-sm text-[var(--blog-subtle)]">No friend links yet.</div>
      </template>
    </section>

    <!-- 申请表单（始终渲染）-->
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
            <span v-if="submitMessage" class="text-sm" :class="submitMessage.includes('submitted') ? 'text-emerald-600' : 'text-[var(--blog-muted)]'">{{ submitMessage }}</span>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>
