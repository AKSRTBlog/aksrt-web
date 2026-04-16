import { ref, shallowRef, watch, readonly } from "vue";
function useGeeTestCaptcha(captchaId, onSuccess, onError) {
  const loaded = ref(false);
  const captcha = shallowRef(null);
  watch(
    captchaId,
    async (value) => {
      loaded.value = false;
      captcha.value?.destroy?.();
      captcha.value = null;
      if (!value?.trim() || true) {
        return;
      }
    },
    { immediate: true }
  );
  function showCaptcha() {
    captcha.value?.showCaptcha();
  }
  return {
    loaded: readonly(loaded),
    showCaptcha
  };
}
export {
  useGeeTestCaptcha as u
};
//# sourceMappingURL=useGeeTestCaptcha-DFKF46Gm.js.map
