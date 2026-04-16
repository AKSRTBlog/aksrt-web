import { ref, shallowRef, watch, readonly } from 'vue';

function useGeeTestCaptcha(captchaId, onSuccess, onError) {
  const loaded = ref(false);
  const captcha = shallowRef(null);
  watch(
    captchaId,
    async (value) => {
      var _a, _b;
      loaded.value = false;
      (_b = (_a = captcha.value) == null ? void 0 : _a.destroy) == null ? void 0 : _b.call(_a);
      captcha.value = null;
      if (!(value == null ? void 0 : value.trim()) || true) {
        return;
      }
    },
    { immediate: true }
  );
  function showCaptcha() {
    var _a;
    (_a = captcha.value) == null ? void 0 : _a.showCaptcha();
  }
  return {
    loaded: readonly(loaded),
    showCaptcha
  };
}

export { useGeeTestCaptcha as u };
//# sourceMappingURL=useGeeTestCaptcha-DFKF46Gm.mjs.map
