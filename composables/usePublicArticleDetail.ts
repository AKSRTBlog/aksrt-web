import type { BlogArticleDetail, ApiEnvelope, PublicArticleDetailItem } from '~/types/blog';
import { mapArticleDetail } from '~/composables/api';
import { readUnlockToken, removeUnlockToken, writeUnlockToken } from '~/utils/article-unlock';
import { resolveRuntimeApiBase } from '~/utils/api-base';

const EXPIRED_UNLOCK_MESSAGE = '凭证已失效，请重新评论a';

export function usePublicArticleDetail(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  const normalizedSlug = computed(() => String(toValue(slug) || '').trim());
  const apiBase = resolveRuntimeApiBase(config);
  const postId = ref('');
  const authorizationToken = ref('');
  const isSyncingStoredToken = ref(false);
  const isRecoveringExpiredToken = ref(false);
  const unlockMessage = ref('');

  const headers = computed<Record<string, string>>(() => {
    if (!authorizationToken.value) {
      return {};
    }

    return {
      Authorization: `Bearer ${authorizationToken.value}`,
    };
  });

  const fetchState = useFetch<ApiEnvelope<PublicArticleDetailItem>, Error, BlogArticleDetail | null>(
    () => `${apiBase}/api/v1/public/articles/${normalizedSlug.value}`,
    {
      key: () => `article-${normalizedSlug.value}`,
      default: () => null,
      headers,
      transform: (response) => response?.data ? mapArticleDetail(response.data) : null,
      watch: [normalizedSlug],
    },
  );

  async function refreshWithStoredToken(targetPostId?: string) {
    if (!import.meta.client) {
      return;
    }

    const effectivePostId = targetPostId || postId.value;
    if (!effectivePostId) {
      return;
    }

    const storedToken = readUnlockToken(effectivePostId);
    if (!storedToken || storedToken === authorizationToken.value) {
      return;
    }

    isSyncingStoredToken.value = true;
    authorizationToken.value = storedToken;

    try {
      await fetchState.refresh();
      unlockMessage.value = '';
    } finally {
      isSyncingStoredToken.value = false;
    }
  }

  async function unlockArticle(targetPostId: string, token: string) {
    if (!targetPostId || !token.trim()) {
      return;
    }

    writeUnlockToken(targetPostId, token);
    postId.value = targetPostId;
    authorizationToken.value = token.trim();
    await fetchState.refresh();
    unlockMessage.value = '';
  }

  async function recoverExpiredUnlock(targetPostId: string) {
    if (!import.meta.client || !targetPostId || isRecoveringExpiredToken.value) {
      return;
    }

    isRecoveringExpiredToken.value = true;
    removeUnlockToken(targetPostId);
    authorizationToken.value = '';
    unlockMessage.value = EXPIRED_UNLOCK_MESSAGE;

    try {
      await fetchState.refresh();
    } finally {
      isRecoveringExpiredToken.value = false;
    }
  }

  function getErrorStatus(error: unknown) {
    const currentError = error as {
      statusCode?: number;
      status?: number;
      response?: {
        status?: number;
      };
    } | null;

    return currentError?.statusCode ?? currentError?.status ?? currentError?.response?.status ?? 0;
  }

  watch(
    () => fetchState.data.value?.id,
    (value) => {
      postId.value = value || '';
    },
    { immediate: true },
  );

  watch(
    () => fetchState.data.value,
    (value) => {
      if (!import.meta.client || !value || isSyncingStoredToken.value) {
        return;
      }

      if (!value.requiresCommentUnlock || value.isUnlocked) {
        return;
      }

      void refreshWithStoredToken(value.id);
    },
    { immediate: true },
  );

  watch(
    () => fetchState.error.value,
    (value) => {
      if (!import.meta.client || !value || isRecoveringExpiredToken.value) {
        return;
      }

      if (getErrorStatus(value) !== 401) {
        return;
      }

      const expiredPostId = postId.value;
      if (!expiredPostId || !authorizationToken.value) {
        return;
      }

      void recoverExpiredUnlock(expiredPostId);
    },
  );

  return {
    article: fetchState.data,
    pending: fetchState.pending,
    error: fetchState.error,
    status: fetchState.status,
    unlockMessage,
    refresh: fetchState.refresh,
    unlockArticle,
  };
}
