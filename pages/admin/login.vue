<script setup lang="ts">
import { fetchCaptchaConfig } from '~/composables/api';
import { useGeeTestCaptcha } from '~/composables/useGeeTestCaptcha';
import { useAdminSession } from '~/composables/useAdminSession';
import type { AdminCaptchaResult } from '~/types/admin';
import { adminPaths } from '~/utils/admin';

definePageMeta({
  layout: false,
  middleware: 'admin-guest',
});

useHead({
  title: 'Admin Login',
  meta: [
    {
      name: 'robots',
      content: 'noindex, nofollow',
    },
  ],
});

const username = ref('');
const password = ref('');
const remember = ref(true);
const submitting = ref(false);
const errorMessage = ref('');
const captchaEnabled = ref(false);
const captchaId = ref<string | null>(null);

const { login } = useAdminSession();

async function performLogin(captcha?: AdminCaptchaResult) {
  if (!username.value.trim() || !password.value.trim()) {
    errorMessage.value = '请输入用户名和密码。';
    return;
  }

  submitting.value = true;
  errorMessage.value = '';

  try {
    await login({
      username: username.value.trim(),
      password: password.value,
      remember: remember.value,
      captcha,
    });

    await navigateTo(adminPaths.dashboard);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败，请稍后重试。';
  } finally {
    submitting.value = false;
  }
}

const { loaded: captchaLoaded, showCaptcha } = useGeeTestCaptcha(
  captchaId,
  async (result) => {
    await performLogin(result);
  },
  (error) => {
    errorMessage.value = error.message;
  },
);

async function handleSubmit() {
  if (captchaEnabled.value) {
    if (!captchaLoaded.value) {
      errorMessage.value = '验证码正在加载，请稍后重试。';
      return;
    }

    showCaptcha();
    return;
  }

  await performLogin();
}

onMounted(async () => {
  try {
    const config = await fetchCaptchaConfig();

    if (config.enabled && config.enabledOnLogin && config.captchaId?.trim()) {
      captchaEnabled.value = true;
      captchaId.value = config.captchaId.trim();
    }
  } catch {
    // Keep the login form usable even if captcha bootstrap fails.
  }
});
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-24 top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div class="absolute -right-20 top-24 h-80 w-80 rounded-full bg-indigo-500/25 blur-3xl" />
      <div class="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-400/20 blur-3xl" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(255,255,255,0.08)_0,rgba(255,255,255,0)_35%),radial-gradient(circle_at_85%_30%,rgba(56,189,248,0.12)_0,rgba(56,189,248,0)_32%)]" />
    </div>

    <div class="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
      <section class="w-full rounded-[28px] border border-white/20 bg-white/90 p-6 text-slate-900 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
        <div class="mb-8 space-y-4">
          <div class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700">安</span>
            管理员安全登录
          </div>
          <div class="space-y-2">
            <h1 class="text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-[2.05rem]">欢迎回来</h1>
            <p class="text-sm leading-6 text-slate-500">登录后进入后台管理中心</p>
          </div>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">用户名</span>
            <input
              v-model="username"
              class="admin-input h-11 rounded-xl bg-white"
              autocomplete="username"
              placeholder="输入用户名"
            />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">登录密码</span>
            <input
              v-model="password"
              class="admin-input h-11 rounded-xl bg-white"
              type="password"
              autocomplete="current-password"
              placeholder="输入密码"
            />
          </label>

          <div class="flex items-center justify-between gap-3">
            <label class="flex min-w-0 items-center gap-2.5 text-sm text-slate-600">
              <input v-model="remember" type="checkbox" class="admin-checkbox" />
              <span class="truncate">记住当前设备</span>
            </label>
            <span v-if="captchaEnabled" class="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">已开启验证码</span>
          </div>

          <p v-if="errorMessage" class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {{ errorMessage }}
          </p>

          <button
            class="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 px-4 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(14,116,144,0.35)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="submitting"
            type="submit"
          >
            {{ submitting ? '登录中...' : '进入管理后台' }}
          </button>
        </form>

        <div class="mt-6 border-t border-slate-200 pt-4 text-center text-sm">
          <NuxtLink class="font-medium text-blue-600 transition hover:text-blue-700" to="/">返回博客前台</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
