import type { FetchError } from 'ofetch';
import type { AdminApiProfile, AdminCaptchaResult, AdminSessionData, ApiEnvelope } from '~/types/admin';
import { resolveRuntimeApiBase } from '~/utils/api-base';

const ADMIN_LOCAL_SESSION_KEY = 'aksrt-admin-session';
const ADMIN_SESSION_SESSION_KEY = 'aksrt-admin-session-temporary';
const TOKEN_EXPIRY_SKEW_MS = 5_000;

let adminSessionExpiryTimer: ReturnType<typeof setTimeout> | null = null;

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AdminApiError';
    this.status = status;
  }
}

function getBrowserStorage(type: 'local' | 'session') {
  if (import.meta.server) {
    return null;
  }

  return type === 'local' ? window.localStorage : window.sessionStorage;
}

function readStoredSession(raw: string | null) {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSessionData;
  } catch {
    return null;
  }
}

function parseExpiryTimestamp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function isExpired(value: string | null | undefined, now = Date.now()) {
  const expiresAt = parseExpiryTimestamp(value);
  if (expiresAt === null) {
    return true;
  }

  return expiresAt <= now + TOKEN_EXPIRY_SKEW_MS;
}

function hasUsableRefreshToken(session: AdminSessionData | null | undefined, now = Date.now()) {
  if (!session?.refreshToken) {
    return false;
  }

  return !isExpired(session.refreshTokenExpiresAt, now);
}

export function loadStoredAdminSession() {
  const sessionStorage = getBrowserStorage('session');
  const localStorage = getBrowserStorage('local');

  const storedSession = (
    readStoredSession(sessionStorage?.getItem(ADMIN_SESSION_SESSION_KEY) ?? null) ??
    readStoredSession(localStorage?.getItem(ADMIN_LOCAL_SESSION_KEY) ?? null)
  );

  if (!storedSession) {
    return null;
  }

  if (!hasUsableRefreshToken(storedSession)) {
    persistStoredAdminSession(null);
    return null;
  }

  return storedSession;
}

function persistStoredAdminSession(session: AdminSessionData | null) {
  const sessionStorage = getBrowserStorage('session');
  const localStorage = getBrowserStorage('local');

  sessionStorage?.removeItem(ADMIN_SESSION_SESSION_KEY);
  localStorage?.removeItem(ADMIN_LOCAL_SESSION_KEY);

  if (!session) {
    return;
  }

  const targetStorage = session.remember ? localStorage : sessionStorage;
  const targetKey = session.remember ? ADMIN_LOCAL_SESSION_KEY : ADMIN_SESSION_SESSION_KEY;
  targetStorage?.setItem(targetKey, JSON.stringify(session));
}

function getFetchError(error: unknown) {
  return error as FetchError<ApiEnvelope<never>>;
}

async function requestAdminApi<T>(path: string, init?: Parameters<typeof $fetch<ApiEnvelope<T>>>[1]) {
  const config = useRuntimeConfig();
  const apiBase = resolveRuntimeApiBase(config);

  try {
    const response = await $fetch<ApiEnvelope<T>>(`${apiBase}${path}`, init);
    return response.data;
  } catch (error) {
    const fetchError = getFetchError(error);
    const status = fetchError.statusCode ?? fetchError.response?.status ?? 500;
    const message = fetchError.data?.message || fetchError.message || 'Admin request failed.';
    throw new AdminApiError(message, status);
  }
}

function prepareHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (init?.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function refreshAdminSessionRequest(currentSession: AdminSessionData) {
  const result = await requestAdminApi<AdminSessionData>('/api/v1/admin/auth/refresh', {
    method: 'POST',
    body: {
      refreshToken: currentSession.refreshToken,
    },
  });

  return {
    ...result,
    remember: currentSession.remember,
  };
}

export function useAdminSession() {
  const session = useState<AdminSessionData | null>('admin-session', () => null);
  const ready = useState('admin-session-ready', () => false);

  function clearExpiryTimer() {
    if (adminSessionExpiryTimer) {
      clearTimeout(adminSessionExpiryTimer);
      adminSessionExpiryTimer = null;
    }
  }

  function scheduleAutoLogout(nextSession: AdminSessionData | null) {
    clearExpiryTimer();

    if (import.meta.server || !nextSession) {
      return;
    }

    const refreshExpiry = parseExpiryTimestamp(nextSession.refreshTokenExpiresAt);
    if (refreshExpiry === null) {
      setSession(null);
      return;
    }

    const delay = Math.max(0, refreshExpiry - Date.now() + TOKEN_EXPIRY_SKEW_MS);
    adminSessionExpiryTimer = setTimeout(() => {
      setSession(null);
    }, delay);
  }

  function hydrateSession() {
    if (ready.value || import.meta.server) {
      return session.value;
    }

    session.value = loadStoredAdminSession();
    scheduleAutoLogout(session.value);
    ready.value = true;
    return session.value;
  }

  function setSession(nextSession: AdminSessionData | null) {
    session.value = nextSession;
    ready.value = true;
    persistStoredAdminSession(nextSession);
    scheduleAutoLogout(nextSession);
  }

  async function login(payload: {
    username: string;
    password: string;
    remember: boolean;
    captcha?: AdminCaptchaResult;
  }) {
    const result = await requestAdminApi<AdminSessionData>('/api/v1/admin/auth/login', {
      method: 'POST',
      body: {
        username: payload.username,
        password: payload.password,
        captcha: payload.captcha,
      },
    });

    const nextSession: AdminSessionData = {
      ...result,
      remember: payload.remember,
    };

    setSession(nextSession);
    return nextSession;
  }

  async function refreshSession() {
    const currentSession = session.value ?? hydrateSession();

    if (!hasUsableRefreshToken(currentSession)) {
      setSession(null);
      throw new AdminApiError('Admin session expired.', 401);
    }

    const nextSession = await refreshAdminSessionRequest(currentSession);
    setSession(nextSession);
    return nextSession;
  }

  async function adminApiFetch<T>(path: string, init?: RequestInit) {
    const currentSession = session.value ?? hydrateSession();

    if (!hasUsableRefreshToken(currentSession)) {
      setSession(null);
      throw new AdminApiError('Admin session expired.', 401);
    }

    let activeSession = currentSession;
    if (!activeSession.accessToken || isExpired(activeSession.accessTokenExpiresAt)) {
      activeSession = await refreshSession().catch((refreshError) => {
        setSession(null);
        throw refreshError;
      });
    }

    const headers = prepareHeaders(init);
    headers.set('Authorization', `Bearer ${activeSession.accessToken}`);

    try {
      return await requestAdminApi<T>(path, {
        ...init,
        headers,
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
      retryHeaders.set('Authorization', `Bearer ${refreshed.accessToken}`);

      return requestAdminApi<T>(path, {
        ...init,
        headers: retryHeaders,
      });
    }
  }

  async function refreshProfile() {
    const profile = await adminApiFetch<AdminApiProfile>('/api/v1/admin/auth/me');

    if (!session.value) {
      return null;
    }

    const nextSession: AdminSessionData = {
      ...session.value,
      admin: profile,
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
    profile: computed(() => session.value?.admin ?? null),
    isAuthenticated: computed(() => Boolean(session.value?.accessToken)),
    hydrateSession,
    setSession,
    login,
    logout,
    refreshProfile,
    adminApiFetch,
  };
}
