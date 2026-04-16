import { r as resolveRuntimeApiBase } from './api-base-COxdl8qP.mjs';
import { b as useNuxtApp, d as useRuntimeConfig } from './server.mjs';
import { computed, toRef, isRef } from 'vue';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const ADMIN_LOCAL_SESSION_KEY = "aksrt-admin-session";
const ADMIN_SESSION_SESSION_KEY = "aksrt-admin-session-temporary";
class AdminApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}
function getBrowserStorage(type) {
  {
    return null;
  }
}
function persistStoredAdminSession(session) {
  const sessionStorage = getBrowserStorage();
  const localStorage = getBrowserStorage();
  sessionStorage == null ? void 0 : sessionStorage.removeItem(ADMIN_SESSION_SESSION_KEY);
  localStorage == null ? void 0 : localStorage.removeItem(ADMIN_LOCAL_SESSION_KEY);
  if (!session) {
    return;
  }
  const targetStorage = session.remember ? localStorage : sessionStorage;
  const targetKey = session.remember ? ADMIN_LOCAL_SESSION_KEY : ADMIN_SESSION_SESSION_KEY;
  targetStorage == null ? void 0 : targetStorage.setItem(targetKey, JSON.stringify(session));
}
function getFetchError(error) {
  return error;
}
async function requestAdminApi(path, init) {
  var _a, _b, _c, _d;
  const config = useRuntimeConfig();
  const apiBase = resolveRuntimeApiBase(config);
  try {
    const response = await $fetch(`${apiBase}${path}`, init);
    return response.data;
  } catch (error) {
    const fetchError = getFetchError(error);
    const status = (_c = (_b = fetchError.statusCode) != null ? _b : (_a = fetchError.response) == null ? void 0 : _a.status) != null ? _c : 500;
    const message = ((_d = fetchError.data) == null ? void 0 : _d.message) || fetchError.message || "Admin request failed.";
    throw new AdminApiError(message, status);
  }
}
function prepareHeaders(init) {
  const headers = new Headers(init == null ? void 0 : init.headers);
  if ((init == null ? void 0 : init.body) && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}
async function refreshAdminSessionRequest(currentSession) {
  const result = await requestAdminApi("/api/v1/admin/auth/refresh", {
    method: "POST",
    body: {
      refreshToken: currentSession.refreshToken
    }
  });
  return {
    ...result,
    remember: currentSession.remember
  };
}
function useAdminSession() {
  const session = useState("admin-session", () => null);
  const ready = useState("admin-session-ready", () => false);
  function hydrateSession() {
    if (ready.value || true) {
      return session.value;
    }
  }
  function setSession(nextSession) {
    session.value = nextSession;
    ready.value = true;
    persistStoredAdminSession(nextSession);
  }
  async function login(payload) {
    const result = await requestAdminApi("/api/v1/admin/auth/login", {
      method: "POST",
      body: {
        username: payload.username,
        password: payload.password,
        captcha: payload.captcha
      }
    });
    const nextSession = {
      ...result,
      remember: payload.remember
    };
    setSession(nextSession);
    return nextSession;
  }
  async function refreshSession() {
    var _a;
    const currentSession = (_a = session.value) != null ? _a : hydrateSession();
    if (!(currentSession == null ? void 0 : currentSession.refreshToken)) {
      setSession(null);
      throw new AdminApiError("Admin session expired.", 401);
    }
    const nextSession = await refreshAdminSessionRequest(currentSession);
    setSession(nextSession);
    return nextSession;
  }
  async function adminApiFetch(path, init) {
    var _a;
    const currentSession = (_a = session.value) != null ? _a : hydrateSession();
    if (!(currentSession == null ? void 0 : currentSession.accessToken)) {
      throw new AdminApiError("Admin session expired.", 401);
    }
    const headers = prepareHeaders(init);
    headers.set("Authorization", `Bearer ${currentSession.accessToken}`);
    try {
      return await requestAdminApi(path, {
        ...init,
        headers
      });
    } catch (error) {
      if (!(error instanceof AdminApiError) || error.status !== 401) {
        throw error;
      }
      const refreshed = await refreshSession().catch((refreshError) => {
        setSession(null);
        throw refreshError;
      });
      const retryHeaders = prepareHeaders(init);
      retryHeaders.set("Authorization", `Bearer ${refreshed.accessToken}`);
      return requestAdminApi(path, {
        ...init,
        headers: retryHeaders
      });
    }
  }
  async function refreshProfile() {
    const profile = await adminApiFetch("/api/v1/admin/auth/me");
    if (!session.value) {
      return null;
    }
    const nextSession = {
      ...session.value,
      admin: profile
    };
    setSession(nextSession);
    return profile;
  }
  function logout() {
    setSession(null);
  }
  return {
    session,
    ready,
    profile: computed(() => {
      var _a, _b;
      return (_b = (_a = session.value) == null ? void 0 : _a.admin) != null ? _b : null;
    }),
    isAuthenticated: computed(() => {
      var _a;
      return Boolean((_a = session.value) == null ? void 0 : _a.accessToken);
    }),
    hydrateSession,
    setSession,
    login,
    logout,
    refreshProfile,
    adminApiFetch
  };
}

export { AdminApiError as A, useAdminSession as u };
//# sourceMappingURL=useAdminSession-fnHBOwsd.mjs.map
