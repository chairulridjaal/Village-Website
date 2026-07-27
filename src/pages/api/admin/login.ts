import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { verifyPassword, createSession, generateSessionId, SESSION_COOKIE, SESSION_TTL } from '../../../lib/auth/session';
import { ADMIN_USER_SELECT, sessionFromRow, type AdminUserRow } from '../../../lib/auth/permissions';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const formData = await request.formData();
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password) {
    return redirect('/admin/login?error=1');
  }

  const env = getEnv();
  if (!env) {
    // Local dev without runtime, allow admin/admin for testing
    if (username === 'admin' && password === 'admin') {
      const sessionId = generateSessionId();
      cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true, secure: false, sameSite: 'lax', path: '/', maxAge: SESSION_TTL,
      });
      return redirect('/admin/dasbor');
    }
    return redirect('/admin/login?error=1');
  }

  const ip = request.headers.get('CF-Connecting-IP');
  const rlKey = ip ? `ratelimit:login:${ip}` : null;
  const attempts = rlKey ? parseInt((await env.SESSION_KV.get(rlKey)) ?? '0', 10) : 0;
  if (rlKey && attempts >= 5) {
    return redirect('/admin/login?error=locked');
  }

  const row = await env.DB.prepare(
    `SELECT ${ADMIN_USER_SELECT} FROM admin_user WHERE username = ?`
  ).bind(username).first<AdminUserRow>();

  if (!row || Number(row.aktif) !== 1 || !(await verifyPassword(password, row.password_hash))) {
    if (rlKey) await env.SESSION_KV.put(rlKey, String(attempts + 1), { expirationTtl: 900 });
    return redirect('/admin/login?error=1');
  }

  if (rlKey) await env.SESSION_KV.delete(rlKey);

  const sessionUser = sessionFromRow(row);
  const sessionId = generateSessionId();
  await createSession(sessionId, sessionUser, env.SESSION_KV);

  cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL,
  });

  return redirect('/admin/dasbor');
};
