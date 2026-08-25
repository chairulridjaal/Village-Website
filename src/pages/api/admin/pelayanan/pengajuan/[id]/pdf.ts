import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { getPengajuanById } from '../../../../../../lib/db/pelayanan';
import { buildSuratVars, fillDocxTemplate } from '../../../../../../lib/pelayanan/docx-fill';
import { loadTemplateBytes } from '../../../../../../lib/pelayanan/docx-template-store';
import { docxBytesToPdf, safePdfFilename } from '../../../../../../lib/pelayanan/docx-to-pdf';

export const GET: APIRoute = async ({ params, request }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env || !Number.isFinite(id)) {
    return new Response('Not found', { status: 404 });
  }

  const p = await getPengajuanById(id, env.DB);
  if (!p || p.status !== 'diterima') {
    return new Response('Surat belum diterima', { status: 404 });
  }

  const path = (p.template_docx_path || '').trim();
  if (!path) {
    return new Response(
      'Jenis surat ini belum punya template Word (.docx). Unggah template di admin jenis surat.',
      { status: 422 }
    );
  }

  const origin = new URL(request.url).origin;
  const bytes = await loadTemplateBytes(path, {
    bucket: env.MEDIA_BUCKET,
    origin,
  });
  if (!bytes) {
    return new Response(
      `File template Word tidak ditemukan (path: ${path}). Pastikan template sudah diunggah ke R2 (media/templates/…).`,
      { status: 404 }
    );
  }

  try {
    const vars = buildSuratVars(p);
    const filledDocx = fillDocxTemplate(bytes, vars);
    const pdf = await docxBytesToPdf(filledDocx, {
      origin,
      bucket: env.MEDIA_BUCKET,
      filename: `${p.nomor || 'surat'}.docx`,
    });
    const filename = safePdfFilename(p.nomor, p.jenis_nama);
    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('fill/convert PDF failed', e);
    const message = e instanceof Error ? e.message : 'Gagal membuat PDF.';
    return new Response(`Gagal membuat PDF dari template Word. ${message}`, { status: 500 });
  }
};
