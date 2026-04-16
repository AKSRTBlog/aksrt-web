import { adminPaths } from '~/utils/admin';
import { loadStoredAdminSession } from '~/composables/useAdminSession';

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) {
    return;
  }

  const session = loadStoredAdminSession();

  if (!session?.accessToken) {
    return navigateTo(adminPaths.login);
  }
});
