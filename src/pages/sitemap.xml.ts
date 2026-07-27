import { getEnv } from '@lib/env';
import { SITE_URL } from '@lib/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const env = getEnv();
  const base = SITE_URL;

  const staticUrls = [
    { loc: base, priority: '1.0', changefreq: 'weekly' },
    { loc: `${base}/profil`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/pemerintahan`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${base}/potensi`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${base}/pelayanan`, priority: '0.85', changefreq: 'weekly' },
    { loc: `${base}/pelayanan/status`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${base}/umkm`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${base}/berita`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/peta`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${base}/kontak`, priority: '0.6', changefreq: 'yearly' },
  ];

  const dynamicUrls: Array<{ loc: string; priority: string; changefreq: string; lastmod?: string }> = [];

  if (env?.DB) {
    const umkmRows = await env.DB.prepare(
      "SELECT slug, updated_at FROM umkm WHERE status='published'"
    ).all<{ slug: string; updated_at: string }>();
    for (const u of umkmRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/umkm/${u.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: u.updated_at?.split('T')[0],
      });
    }

    const beritaRows = await env.DB.prepare(
      "SELECT slug, published_at FROM berita WHERE status='published'"
    ).all<{ slug: string; published_at: string }>();
    for (const b of beritaRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/berita/${b.slug}`,
        priority: '0.6',
        changefreq: 'yearly',
        lastmod: b.published_at?.split('T')[0],
      });
    }

    const potensiRows = await env.DB.prepare(
      "SELECT slug, updated_at FROM potensi WHERE status='published'"
    ).all<{ slug: string; updated_at: string }>().catch(() => ({ results: [] as { slug: string; updated_at: string }[] }));
    for (const p of potensiRows.results ?? []) {
      dynamicUrls.push({
        loc: `${base}/potensi/${p.slug}`,
        priority: '0.7',
        changefreq: 'monthly',
        lastmod: p.updated_at?.split('T')[0],
      });
    }
  }

  const allUrls = [...staticUrls, ...dynamicUrls];
  const today = new Date().toISOString().split('T')[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod ?? today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
