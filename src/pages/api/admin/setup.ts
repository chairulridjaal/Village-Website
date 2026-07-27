import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hashPassword, createSession, generateSessionId, SESSION_COOKIE, SESSION_TTL } from '../../../lib/auth/session';
import { ADMIN_USER_SELECT, sessionFromRow, type AdminUserRow } from '../../../lib/auth/permissions';

export const POST: APIRoute = async ({ request, redirect, cookies }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/login');

  const existing = await env.DB.prepare('SELECT id FROM admin_user LIMIT 1').first();
  if (existing) return redirect('/admin/login');

  const formData = await request.formData();
  const username = (formData.get('username') as string)?.trim();
  const password = formData.get('password') as string;

  if (!username || !password || password.length < 8) {
    return redirect('/admin/setup?error=Nama+pengguna+atau+kata+sandi+tidak+valid.');
  }

  const hash = await hashPassword(password);
  await env.DB.prepare(`
    INSERT INTO admin_user (
      username, password_hash, is_master, aktif,
      perm_konten, perm_pelayanan, perm_umkm, perm_berita,
      perm_peta, perm_media, perm_pengaturan
    ) VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, 1, 1)
  `).bind(username, hash).run();

  const row = await env.DB.prepare(
    `SELECT ${ADMIN_USER_SELECT} FROM admin_user WHERE username = ?`
  ).bind(username).first<AdminUserRow>();

  if (!row) return redirect('/admin/setup?error=Gagal+membuat+akun.');

  const sessionId = generateSessionId();
  await createSession(sessionId, sessionFromRow(row), env.SESSION_KV);
  cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: SESSION_TTL,
  });

  return redirect('/admin/dasbor');
};
