import type { AdminCaptchaResult } from '~/types/admin';

interface GeeTestCaptchaInstance {
  showCaptcha: () => void;
  destroy?: () => void;
  onReady: (callback: () => void) => void;
  onSuccess: (callback: () => void) => void;
  onError: (callback: (error: Error) => void) => void;
  getValidate: () => AdminCaptchaResult | null;
}

declare global {
  interface Window {
    initGeetest4?: (
      config: {
        captchaId: string;
        product: 'bind' | 'float' | 'popup';
        language: 'zho' | 'eng' | 'jpn' | 'kor';
      },
      callback: (captcha: GeeTestCaptchaInstance) => void,
    ) => void;
  }
}

function loadGeeTestScript() {
  if (import.meta.server) {
    return Promise.resolve();
  }

  if (window.initGeetest4) {
    return Promise.resolve();
  }

  const existing = document.querySelector<HTMLScriptElement>('script[data-geetest-script="true"]');

  if (existing) {
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load GeeTest script.')), {
        once: true,
      });
    });
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://static.geetest.com/v4/gt4.js';
    script.async = true;
    script.dataset.geetestScript = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load GeeTest script.'));
    document.head.appendChild(script);
  });
}

export function useGeeTestCaptcha(
  captchaId: Ref<string | null>,
  onSuccess: (result: AdminCaptchaResult) => void,
  onError?: (error: Error) => void,
) {
  const loaded = ref(false);
  const captcha = shallowRef<GeeTestCaptchaInstance | null>(null);

  async function initCaptcha(nextCaptchaId: string) {
    await loadGeeTestScript();

    if (!window.initGeetest4) {
      throw new Error('GeeTest runtime is unavailable.');
    }

    await new Promise<void>((resolve, reject) => {
      window.initGeetest4!(
        {
          captchaId: nextCaptchaId,
          product: 'bind',
          language: 'zho',
        },
        (instance) => {
          captcha.value = instance;

          instance.onReady(() => {
            loaded.value = true;
            resolve();
          });

          instance.onSuccess(() => {
            const result = instance.getValidate();

            if (result) {
              onSuccess(result);
            }
          });

          instance.onError((error) => {
            reject(error);
            onError?.(error);
          });
        },
      );
    });
  }

  watch(
    captchaId,
    async (value) => {
      loaded.value = false;
      captcha.value?.destroy?.();
      captcha.value = null;

      if (!value?.trim() || import.meta.server) {
        return;
      }

      try {
        await initCaptcha(value);
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('GeeTest initialization failed.'));
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    captcha.value?.destroy?.();
  });

  function showCaptcha() {
    captcha.value?.showCaptcha();
  }

  return {
    loaded: readonly(loaded),
    showCaptcha,
  };
}
