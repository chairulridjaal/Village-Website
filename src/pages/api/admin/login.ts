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
  const rlIpKey = ip ? `ratelimit:login:${ip}` : null;
  const rlAccKey = `ratelimit:login:acc:${username.toLowerCase()}`;
  const [ipAttempts, accAttempts] = await Promise.all([
    rlIpKey ? env.SESSION_KV.get(rlIpKey).then(v => parseInt(v ?? '0', 10)) : Promise.resolve(0),
    env.SESSION_KV.get(rlAccKey).then(v => parseInt(v ?? '0', 10)),
  ]);
  if ((rlIpKey && ipAttempts >= 5) || accAttempts >= 5) {
    return redirect('/admin/login?error=locked');
  }

  const row = await env.DB.prepare(
    `SELECT ${ADMIN_USER_SELECT} FROM admin_user WHERE username = ?`
  ).bind(username).first<AdminUserRow>();

  if (!row || Number(row.aktif) !== 1 || !(await verifyPassword(password, row.password_hash))) {
    const ttl = { expirationTtl: 900 };
    if (rlIpKey) await env.SESSION_KV.put(rlIpKey, String(ipAttempts + 1), ttl);
    await env.SESSION_KV.put(rlAccKey, String(accAttempts + 1), ttl);
    return redirect('/admin/login?error=1');
  }

  if (rlIpKey) await env.SESSION_KV.delete(rlIpKey);
  await env.SESSION_KV.delete(rlAccKey);

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
