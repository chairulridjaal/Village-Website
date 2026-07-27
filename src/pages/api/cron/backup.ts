import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = getEnv();

  if (!env?.DB || !env?.MEDIA_BUCKET) {
    return new Response('Cron: env not available', { status: 503 });
  }

  try {
    const date = new Date().toISOString().split('T')[0];
    const tables = ['admin_user', 'page_section', 'umkm', 'berita', 'media', 'media_link', 'titik_peta', 'perangkat_desa', 'jenis_pelayanan', 'pengajuan_pelayanan', 'lampiran_pengajuan'];

    const backup: Record<string, unknown[]> = {};
    for (const table of tables) {
      const { results } = await env.DB.prepare(`SELECT * FROM ${table}`).all();
      backup[table] = results ?? [];
    }

    const key = `backups/db-backup-${date}.json`;
    const body = JSON.stringify(backup, null, 2);
    await env.MEDIA_BUCKET.put(key, body, { httpMetadata: { contentType: 'application/json' } });

    return new Response(JSON.stringify({ ok: true, key, date }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
