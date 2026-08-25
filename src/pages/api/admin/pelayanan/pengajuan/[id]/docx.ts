import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { getPengajuanById } from '../../../../../../lib/db/pelayanan';
import {
  buildSuratVars,
  fillDocxTemplate,
  safeDocxFilename,
} from '../../../../../../lib/pelayanan/docx-fill';
import { loadTemplateBytes } from '../../../../../../lib/pelayanan/docx-template-store';

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
      `File template Word tidak ditemukan (path: ${path}). Pastikan template sudah diunggah ke R2.`,
      { status: 404 }
    );
  }

  try {
    const vars = buildSuratVars(p);
    const filled = fillDocxTemplate(bytes, vars);
    const filename = safeDocxFilename(p.nomor, p.jenis_nama);
    return new Response(filled, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('fillDocx failed', e);
    return new Response(
      'Gagal mengisi template Word. Pastikan placeholder memakai {nama}, {nik}, dll.',
      { status: 500 }
    );
  }
};
