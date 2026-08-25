import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';

const FILENAME = 'Modul Pengelola Website Desa Citarik.pdf';
const NOT_FOUND = {
  status: 404 as const,
  headers: { 'Content-Type': 'text/plain; charset=utf-8' },
};

export const GET: APIRoute = async ({ request }) => {
  const assetUrl = new URL('/modul-panduan.pdf', request.url);

  // Self-fetching our own URL on a routed custom domain would loop back into
  // this Worker — always prefer the ASSETS binding when available.
  const env = getEnv();
  let res: Response;
  try {
    res = env?.ASSETS
      ? await env.ASSETS.fetch(new Request(assetUrl))
      : await fetch(assetUrl);
  } catch {
    return new Response('Modul panduan tidak ditemukan.', NOT_FOUND);
  }

  if (!res.ok) return new Response('Modul panduan tidak ditemukan.', NOT_FOUND);

  const headers = new Headers();
  headers.set('Content-Type', 'application/pdf');
  headers.set('Content-Disposition', `inline; filename="${FILENAME}"`);
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(res.body, { status: 200, headers });
};
