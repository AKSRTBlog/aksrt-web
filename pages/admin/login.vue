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
  <div class="min-h-screen bg-slate-950 px-6 py-10 text-white">
    <div class="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <section class="space-y-8">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300">
            安
          </span>
          后台仅面向管理员开放
        </div>

        <div>
          <h1 class="max-w-2xl text-5xl font-semibold leading-tight tracking-[-0.05em] text-white md:text-6xl">
            用更集中的后台入口，管理文章、评论、媒体与站点设置。
          </h1>
          <p class="mt-6 max-w-xl text-base leading-8 text-slate-300">
            登录后即可进入统一后台，内容发布、评论审核、Banner、SMTP 与存储配置都已经接入新的 Rust + PostgreSQL 后端。
          </p>
        </div>

        <div class="grid gap-4 md:grid-cols-3">
          <div class="rounded-[4px] border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">统一入口</p>
            <p class="mt-2 text-sm leading-7 text-slate-300">Nuxt 已接管后台路由，登录后可直接进入各管理模块。</p>
          </div>
          <div class="rounded-[4px] border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">新后端</p>
            <p class="mt-2 text-sm leading-7 text-slate-300">后台接口已运行在 Rust + PostgreSQL 上，数据流不再依赖旧 Node API。</p>
          </div>
          <div class="rounded-[4px] border border-white/10 bg-white/5 p-5">
            <p class="text-sm font-semibold text-white">渐进迁移</p>
            <p class="mt-2 text-sm leading-7 text-slate-300">原生 Nuxt 页面会逐步替换旧后台页面，不影响现有功能继续使用。</p>
          </div>
        </div>
      </section>

      <section class="admin-card mx-auto w-full max-w-xl p-8 text-slate-900">
        <div class="mb-8 flex items-center gap-3">
          <div class="flex h-12 w-12 items-center justify-center rounded-[4px] bg-blue-600 text-white">
            登
          </div>
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Admin Login</p>
            <h2 class="mt-1 text-2xl font-semibold tracking-[-0.03em]">管理员登录</h2>
          </div>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">用户名</span>
            <input v-model="username" class="admin-input" autocomplete="username" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-medium text-slate-700">登录密码</span>
            <input v-model="password" class="admin-input" type="password" autocomplete="current-password" />
          </label>

          <label class="flex items-center gap-3 text-sm text-slate-600">
            <input v-model="remember" type="checkbox" />
            记住当前设备
          </label>

          <p v-if="errorMessage" class="text-sm text-rose-600">{{ errorMessage }}</p>

          <button class="admin-button-primary w-full" :disabled="submitting" type="submit">
            {{ submitting ? '登录中...' : '进入管理后台' }}
          </button>
        </form>

        <div class="mt-6 flex items-center justify-end text-sm text-slate-500">
          <NuxtLink class="font-medium text-blue-600" to="/">返回博客前台</NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>
