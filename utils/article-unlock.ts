const UNLOCK_TOKEN_PREFIX = 'unlock_token_';

function canUseStorage() {
  return import.meta.client && typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function buildUnlockTokenKey(postId: string) {
  return `${UNLOCK_TOKEN_PREFIX}${postId}`;
}

export function readUnlockToken(postId: string) {
  if (!canUseStorage() || !postId) {
    return '';
  }

  return window.localStorage.getItem(buildUnlockTokenKey(postId)) || '';
}

export function writeUnlockToken(postId: string, token: string) {
  if (!canUseStorage() || !postId) {
    return;
  }

  const key = buildUnlockTokenKey(postId);
  if (token.trim()) {
    window.localStorage.setItem(key, token.trim());
    return;
  }

  window.localStorage.removeItem(key);
}
