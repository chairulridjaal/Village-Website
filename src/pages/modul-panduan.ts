import type { APIRoute } from 'astro';

const FILENAME = 'Modul Pengelola Website Desa Citarik.pdf';

export const GET: APIRoute = async ({ request }) => {
  const assetUrl = new URL('/modul-panduan.pdf', request.url);
  const res = await fetch(assetUrl);

  if (!res.ok) {
    return new Response('Modul panduan tidak ditemukan.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const headers = new Headers(res.headers);
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `inline; filename="${FILENAME}"`);
  headers.set('Cache-Control', 'public, max-age=86400');
  headers.delete('Content-Length');

  return new Response(res.body, { status: 200, headers });
};
