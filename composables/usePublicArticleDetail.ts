import type { BlogArticleDetail, ApiEnvelope, PublicArticleDetailItem } from '~/types/blog';
import { mapArticleDetail } from '~/composables/api';
import { readUnlockToken, writeUnlockToken } from '~/utils/article-unlock';
import { resolveRuntimeApiBase } from '~/utils/api-base';

export function usePublicArticleDetail(slug: MaybeRefOrGetter<string>) {
  const config = useRuntimeConfig();
  const normalizedSlug = computed(() => String(toValue(slug) || '').trim());
  const apiBase = resolveRuntimeApiBase(config);
  const postId = ref('');
  const authorizationToken = ref('');
  const isSyncingStoredToken = ref(false);

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

  return {
    article: fetchState.data,
    pending: fetchState.pending,
    error: fetchState.error,
    status: fetchState.status,
    refresh: fetchState.refresh,
    unlockArticle,
  };
}
