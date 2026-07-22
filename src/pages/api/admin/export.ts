import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ locals }) => {
  const env = getEnv();
  if (!env) return new Response('Unavailable', { status: 503 });

  const [pageSections, wisata, umkm, berita, titikPeta, perangkat, media] = await Promise.all([
    env.DB.prepare('SELECT * FROM page_section').all(),
    env.DB.prepare('SELECT * FROM wisata').all(),
    env.DB.prepare('SELECT * FROM umkm').all(),
    env.DB.prepare('SELECT * FROM berita').all(),
    env.DB.prepare('SELECT * FROM titik_peta').all(),
    env.DB.prepare('SELECT * FROM perangkat_desa').all(),
    env.DB.prepare('SELECT id, r2_key_display, r2_key_thumb, alt, uploaded_at FROM media').all(),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    version: '1.0',
    tables: {
      page_section: pageSections.results,
      wisata: wisata.results,
      umkm: umkm.results,
      berita: berita.results,
      titik_peta: titikPeta.results,
      perangkat_desa: perangkat.results,
      media: media.results,
    },
  };

  const date = new Date().toISOString().slice(0, 10);
  const filename = `web-desa-citarik-export-${date}.json`;

  return new Response(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
};
