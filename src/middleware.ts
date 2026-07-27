import { getEnv } from '@lib/env';
import { defineMiddleware } from 'astro:middleware';
import { validateSession, SESSION_COOKIE } from './lib/auth/session';
import { hasPerm, permForAdminPath, type PermFlag } from './lib/auth/permissions';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  const isLoginPage = pathname === '/admin/login';
  const isSetupPage = pathname === '/admin/setup';
  const isApiLogin = pathname === '/api/admin/login';
  const isApiSetup = pathname === '/api/admin/setup';

  const needsAuth =
    (isAdminPage && !isLoginPage && !isSetupPage) ||
    (isAdminApi && !isApiLogin && !isApiSetup);

  if (needsAuth) {
    const env = getEnv();

    if (!env) return next(); // local dev without runtime, allow through

    const sessionId = context.cookies.get(SESSION_COOKIE)?.value;
    const user = sessionId ? await validateSession(sessionId, env.SESSION_KV) : null;

    if (!user) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/login');
    }

    context.locals.user = user;

    const need = permForAdminPath(pathname);
    if (need === 'master' && !user.is_master) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/dasbor?error=forbidden');
    }
    if (need && need !== 'master' && !hasPerm(user, need as PermFlag)) {
      if (isAdminApi) {
        return new Response(JSON.stringify({ error: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin/dasbor?error=forbidden');
    }
  }

  return next();
});
