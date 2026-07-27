import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import {
  getLampiranById,
  getPengajuanById,
  getPengajuanForStatusCheck,
} from '../../../../lib/db/pelayanan';
import { validateSession, SESSION_COOKIE } from '../../../../lib/auth/session';

export const GET: APIRoute = async ({ params, request, cookies }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env?.MEDIA_BUCKET || !Number.isFinite(id)) {
    return new Response('Not found', { status: 404 });
  }

  const lampiran = await getLampiranById(id, env.DB);
  if (!lampiran) return new Response('Not found', { status: 404 });

  const pengajuan = await getPengajuanById(lampiran.pengajuan_id, env.DB);
  if (!pengajuan) return new Response('Not found', { status: 404 });

  const sessionId = cookies.get(SESSION_COOKIE)?.value;
  const admin = sessionId ? await validateSession(sessionId, env.SESSION_KV) : null;

  if (!admin) {
    const url = new URL(request.url);
    const nomor = url.searchParams.get('nomor') ?? '';
    const wa = url.searchParams.get('wa') ?? '';
    const ok = await getPengajuanForStatusCheck(nomor, wa, env.DB);
    if (!ok || ok.id !== pengajuan.id) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const obj = await env.MEDIA_BUCKET.get(lampiran.r2_key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  headers.set('Content-Type', lampiran.content_type || obj.httpMetadata?.contentType || 'application/octet-stream');
  headers.set('Content-Disposition', `inline; filename="${lampiran.filename.replace(/"/g, '')}"`);
  headers.set('Cache-Control', 'private, no-store');

  return new Response(obj.body, { headers });
};