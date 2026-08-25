import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { importJenisFromDocx } from '../../../../../lib/pelayanan/docx-import';

const MAX_BYTES = 8 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const env = getEnv();
  if (!env && import.meta.env.PROD) {
    return new Response(JSON.stringify({ error: 'server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'form' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const file = fd.get('docx');
  if (!(file instanceof File) || file.size <= 0) {
    return new Response(JSON.stringify({ error: 'file', message: 'Pilih file .docx.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'size', message: 'File terlalu besar (maks. 8 MB).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const name = (file.name || '').toLowerCase();
  const type = file.type || '';
  const okType =
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    type === 'application/octet-stream' ||
    type === 'application/zip';
  if (!okType) {
    return new Response(JSON.stringify({ error: 'type', message: 'Hanya file .docx yang didukung.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const buf = await file.arrayBuffer();
    const result = await importJenisFromDocx(buf);
    return new Response(JSON.stringify({ ok: true, ...result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal membaca dokumen.';
    return new Response(JSON.stringify({ error: 'parse', message }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
